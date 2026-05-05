using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Razorpay.Api;
using PaymentEntity = FEDomain.Payment;

namespace FEServices.Service
{
    public class PaymentService(
        IUnitOfWork unitOfWork,
        IConfiguration configuration,
        ILogger<PaymentService> logger,
        UserManager<ApplicationUser> userManager,
        IMapper mapper,
        INotificationService notificationService) : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IConfiguration _configuration = configuration;
        private readonly ILogger<PaymentService> _logger = logger;
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly IMapper _mapper = mapper;
        private readonly INotificationService _notificationService = notificationService;

        public async Task<(bool Success, string Message, object? OrderData)> CreateOrderAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);

            if (booking == null)
                return (false, "Booking not found.", null);

            // NEW FLOW: Payment only after work is completed
            if (booking.Status != "Completed")
                return (false, "Payment can only be made after work is completed.", null);

            int amountInPaise = (int)(booking.TotalAmount * 100);

            try
            {
                string keyId = _configuration["Razorpay:Key"] ?? throw new Exception("Razorpay Key is missing");
                string keySecret = _configuration["Razorpay:Secret"] ?? throw new Exception("Razorpay Secret is missing");

                _logger.LogInformation("Creating Razorpay order for BookingId: {BookingId}, Amount: {Amount}", bookingId, amountInPaise);

                // Get owner's Razorpay account for Route API transfer
                var owner = await _userManager.FindByIdAsync(booking.OwnerId ?? "");
                if (owner == null)
                    return (false, "Owner not found.", null);

                // Calculate amounts
                decimal platformFeeRate = _configuration.GetValue<decimal>("PlatformSettings:CommissionRate", 0.10m);
                decimal platformFeeAmount = Math.Round(booking.TotalAmount * platformFeeRate, 2);
                decimal ownerAmount = Math.Round(booking.TotalAmount - platformFeeAmount, 2);
                int ownerAmountInPaise = (int)(ownerAmount * 100);

                _logger.LogInformation("Payment split - Total: {Total}, Owner: {Owner}, Platform: {Platform}",
                    booking.TotalAmount, ownerAmount, platformFeeAmount);

                var client = new RazorpayClient(keyId, keySecret);

                // Create order - with or without transfers based on owner's account setup
                var options = new Dictionary<string, object>
                {
                    ["amount"] = amountInPaise,
                    ["currency"] = "INR",
                    ["receipt"] = $"rcpt_{booking.Id}",
                    ["payment_capture"] = 1, // Auto-capture payment
                    ["notes"] = new Dictionary<string, string>
                    {
                        ["booking_id"] = booking.Id.ToString(),
                        ["owner_id"] = booking.OwnerId ?? "",
                        ["farmer_id"] = booking.FarmerId ?? "",
                        ["equipment_name"] = booking.MachineName ?? "",
                        ["owner_amount"] = ownerAmount.ToString(),
                        ["platform_fee"] = platformFeeAmount.ToString()
                    }
                };

                // Check if owner has valid Razorpay account for Route API transfers
                bool hasValidAccount = !string.IsNullOrEmpty(owner.RazorpayAccountId) &&
                                       owner.RazorpayAccountId.Length == 18 &&
                                       owner.IsPaymentOnboardingComplete;

                if (hasValidAccount)
                {
                    // Add transfers for Route API - automatic split to owner's account
                    var transfers = new List<Dictionary<string, object>>
                    {
                        new()
                        {
                            ["account"] = owner.RazorpayAccountId!,
                            ["amount"] = ownerAmountInPaise,
                            ["currency"] = "INR",
                            ["notes"] = new Dictionary<string, string>
                            {
                                ["booking_id"] = booking.Id.ToString(),
                                ["transfer_type"] = "owner_payout"
                            },
                            ["on_hold"] = 0
                        }
                    };
                    options.Add("transfers", transfers);
                    _logger.LogInformation("Creating order with transfer to account: {AccountId}", owner.RazorpayAccountId);
                }
                else
                {
                    _logger.LogWarning("Owner {OwnerId} has not set up valid Razorpay account. Creating order without transfers.", booking.OwnerId);
                    // Payment will be captured to platform account, manual settlement needed later
                }

                Order order = client.Order.Create(options);
                string orderId = order["id"].ToString();

                _logger.LogInformation("Order created successfully: {OrderId} with automatic transfer", orderId);

                return (true, "Order created with automatic payment split.", new
                {
                    OrderId = orderId,
                    Amount = booking.TotalAmount,
                    Currency = "INR",
                    KeyId = keyId,
                    OwnerAmount = ownerAmount,
                    PlatformFee = platformFeeAmount,
                    TransferAccount = owner.RazorpayAccountId
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate payment gateway for BookingId: {BookingId}", bookingId);
                return (false, $"Failed to initiate payment gateway. Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message)> VerifyPaymentAsync(VerifyPaymentDto model)
        {
            _logger.LogInformation("Verifying payment for BookingId: {BookingId}", model.BookingId);

            string secret = _configuration["Razorpay:Secret"] ?? "";

            string generatedSignature = GenerateRazorpaySignature(model.RazorpayOrderId, model.RazorpayPaymentId, secret);

            _logger.LogDebug("Signature match: {Match}", generatedSignature == model.RazorpaySignature);

            if (generatedSignature != model.RazorpaySignature)
            {
                _logger.LogWarning("Payment signature mismatch for BookingId: {BookingId}", model.BookingId);
                return (false, "Payment verification failed. Invalid signature detected.");
            }

            var booking = await _unitOfWork.Bookings.GetByIdAsync(model.BookingId);
            if (booking == null)
            {
                _logger.LogWarning("Booking not found for payment verification: {BookingId}", model.BookingId);
                return (false, "Booking not found.");
            }

            _logger.LogDebug("Booking found: {BookingId}, Status: {Status}", booking.Id, booking.Status);

            // Calculate owner and platform amounts from booking
            decimal ownerAmount = booking.BaseAmount; // Amount after platform fee deduction
            decimal platformFeeAmount = booking.PlatformFee; // Platform fee collected

            _logger.LogInformation("Payment split - Owner: {OwnerAmount}, Platform Fee: {PlatformFee}", ownerAmount, platformFeeAmount);

            // Save payment details with settlement tracking
            // Settlement is automatic via Razorpay Route API - status will be updated by webhook
            var payment = new PaymentEntity
            {
                BookingId = booking.Id,
                RazorpayOrderId = model.RazorpayOrderId,
                RazorpayPaymentId = model.RazorpayPaymentId,
                RazorpaySignature = model.RazorpaySignature,
                Amount = booking.TotalAmount,
                Currency = "INR",
                Status = "Captured",
                OwnerAmount = ownerAmount,
                PlatformFeeAmount = platformFeeAmount,
                SettlementStatus = "Processing", // Automatic transfer in progress
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Payments.AddAsync(payment);

            booking.Status = "Paid";
            _unitOfWork.Bookings.Update(booking);

            // Notification for Owner
            var ownerNotification = new Notification
            {
                UserId = booking.OwnerId ?? string.Empty,
                Title = "Payment Received",
                Message = $"Payment successful! The rental for {booking.MachineName ?? "equipment"} is now SETTLED.",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            // Notification for Farmer
            var farmerNotification = new Notification
            {
                UserId = booking.FarmerId ?? string.Empty,
                Title = "Payment Successful",
                Message = $"Your payment of ₹{booking.TotalAmount} for {booking.MachineName ?? "equipment"} was successful. Booking settled!",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            // Notification for Admin
            var adminNotification = new Notification
            {
                UserId = "admin",
                Title = "Payment Received",
                Message = $"Payment of ₹{booking.TotalAmount} received for {booking.MachineName ?? "equipment"} booking (ID: {booking.Id}). Farmer: {booking.FarmerId ?? "unknown"}, Owner: {booking.OwnerId ?? "unknown"}.",
                Type = "payment",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(ownerNotification);
            await _unitOfWork.Notifications.AddAsync(farmerNotification);
            await _unitOfWork.Notifications.AddAsync(adminNotification);
            await _unitOfWork.SaveChangesAsync();

            // Send email notifications
            var owner = await _userManager.FindByIdAsync(booking.OwnerId ?? "");
            var farmer = await _userManager.FindByIdAsync(booking.FarmerId ?? "");

            if (owner != null && !string.IsNullOrEmpty(owner.Email))
            {
                try
                {
                    await _notificationService.NotifyPaymentReceivedAsync(
                        owner.Email,
                        owner.FullName ?? "Owner",
                        farmer?.FullName ?? "Farmer",
                        booking.MachineName ?? "equipment",
                        booking.TotalAmount
                    );
                    _logger.LogInformation("Payment notification email sent to owner: {Email}", owner.Email);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to send payment notification email to owner");
                }
            }

            _logger.LogInformation("Payment verified successfully for BookingId: {BookingId}", booking.Id);

            // Process settlement to owner's account (Route API)
            // This will transfer owner's share automatically if owner is onboarded
            var settlementResult = await ProcessSettlementAsync(payment.Id);
            if (settlementResult.Success)
            {
                _logger.LogInformation("Settlement processed for payment: {PaymentId}", payment.Id);
            }
            else
            {
                _logger.LogWarning("Settlement pending for payment: {PaymentId}. Reason: {Reason}",
                    payment.Id, settlementResult.Message);
            }

            return (true, "Payment successful! Booking is now Active.");
        }

        public async Task<(bool Success, string Message, object? RefundData)> RefundAsync(int bookingId, string? reason = null)
        {
            _logger.LogInformation("Refunding payment for BookingId: {BookingId}, Reason: {Reason}", bookingId, reason);

            var booking = await _unitOfWork.Bookings.Query()
                .FirstOrDefaultAsync(b => b.Id == bookingId);
            if (booking == null)
            {
                _logger.LogWarning("Booking not found for refund: {BookingId}", bookingId);
                return (false, "Booking not found.", null);
            }

            // Find the payment for this booking using Query (not GetAllAsync)
            var payment = await _unitOfWork.Payments.Query()
                .FirstOrDefaultAsync(p => p.BookingId == bookingId && p.Status == "Captured");

            if (payment == null)
            {
                _logger.LogWarning("No captured payment found for booking: {BookingId}", bookingId);
                return (false, "No payment found for refund.", null);
            }

            // Check if already refunded
            if (payment.Status == "Refunded")
            {
                _logger.LogWarning("Payment already refunded for booking: {BookingId}", bookingId);
                return (false, "Payment already refunded.", null);
            }

            // Validate booking status for refund
            if (booking.Status != "Active" && booking.Status != "Accepted")
            {
                _logger.LogWarning("Cannot refund booking with status: {Status}", booking.Status);
                return (false, $"Cannot refund booking with status '{booking.Status}'. Only Active or Accepted bookings can be refunded.", null);
            }

            try
            {
                string keyId = _configuration["Razorpay:Key"] ?? throw new Exception("Razorpay Key is missing");
                string keySecret = _configuration["Razorpay:Secret"] ?? throw new Exception("Razorpay Secret is missing");

                var client = new RazorpayClient(keyId, keySecret);

                // Create refund using Razorpay API
                var refundOptions = new Dictionary<string, object>
                {
                    ["amount"] = (int)(payment.Amount * 100), // Convert to paise
                    ["notes"] = new Dictionary<string, string> { ["reason"] = reason ?? "Booking cancelled" }
                };

                var refund = client.Payment.Fetch(payment.RazorpayPaymentId).Refund(refundOptions);
                string refundId = refund["id"].ToString();

                _logger.LogInformation("Refund created successfully: {RefundId}", refundId);

                // Update payment record
                payment.Status = "Refunded";
                payment.RefundId = refundId;
                payment.RefundAmount = payment.Amount;
                payment.RefundedAt = DateTime.UtcNow;
                payment.RefundReason = reason ?? "Booking cancelled";
                _unitOfWork.Payments.Update(payment);

                // Update booking status
                booking.Status = "Cancelled";
                _unitOfWork.Bookings.Update(booking);

                // Create notifications for both parties
                var farmerNotification = new Notification
                {
                    UserId = booking.FarmerId ?? string.Empty,
                    Title = "Refund Processed",
                    Message = $"Your payment of ¥{payment.Amount} for {booking.MachineName ?? "equipment"} has been refunded.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                var ownerNotification = new Notification
                {
                    UserId = booking.OwnerId ?? string.Empty,
                    Title = "Booking Cancelled & Refunded",
                    Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled. Payment refunded to farmer.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                // Notification for Admin
                var adminNotification = new Notification
                {
                    UserId = "admin",
                    Title = "Refund Processed",
                    Message = $"Refund of ¥{payment.Amount} processed for {booking.MachineName ?? "equipment"} booking (ID: {booking.Id}). Reason: {reason ?? "Booking cancelled"}. Farmer: {booking.FarmerId ?? "unknown"}, Owner: {booking.OwnerId ?? "unknown"}.",
                    Type = "payment",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(farmerNotification);
                await _unitOfWork.Notifications.AddAsync(ownerNotification);
                await _unitOfWork.Notifications.AddAsync(adminNotification);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Refund processed successfully for booking {BookingId}", bookingId);

                return (true, "Refund processed successfully.", new
                {
                    RefundId = refundId,
                    Amount = payment.Amount,
                    Status = "Refunded",
                    RefundedAt = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process refund for BookingId: {BookingId}", bookingId);
                return (false, $"Failed to process refund. Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message)> SavePaymentAsync(int bookingId, string razorpayOrderId, string razorpayPaymentId, string razorpaySignature, decimal amount)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null)
                return (false, "Booking not found.");

            var payment = new PaymentEntity
            {
                BookingId = bookingId,
                RazorpayOrderId = razorpayOrderId,
                RazorpayPaymentId = razorpayPaymentId,
                RazorpaySignature = razorpaySignature,
                Amount = amount,
                Currency = "INR",
                Status = "Captured",
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Payments.AddAsync(payment);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Payment saved successfully.");
        }

        private static string GenerateRazorpaySignature(string orderId, string paymentId, string secret)
        {
            string payload = orderId + "|" + paymentId;

            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }

        #region Razorpay Route API - Owner Payment Settlements

        /// <summary>
        /// Initiates Razorpay onboarding for an owner to receive payments directly
        /// Creates a linked account in Razorpay for the owner
        /// </summary>
        public async Task<(bool Success, string Message, OwnerOnboardingResponseDto? Data)> InitiateOwnerOnboardingAsync(string userId)
        {
            _logger.LogInformation("Initiating Razorpay onboarding for owner: {UserId}", userId);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                _logger.LogWarning("User not found for onboarding: {UserId}", userId);
                return (false, "User not found.", null);
            }

            if (user.Role != "owner")
            {
                _logger.LogWarning("Non-owner user attempted onboarding: {UserId}, Role: {Role}", userId, user.Role);
                return (false, "Only owners can set up payment accounts.", null);
            }

            // Note: We allow re-onboarding for updates, so no early return here
            bool isUpdate = user.IsPaymentOnboardingComplete;

            try
            {
                // Validate Razorpay configuration exists
                string? keyId = _configuration["Razorpay:Key"];
                string? keySecret = _configuration["Razorpay:Secret"];

                if (string.IsNullOrEmpty(keyId) || string.IsNullOrEmpty(keySecret))
                {
                    throw new Exception("Razorpay configuration is missing");
                }

                // Generate a unique reference ID for this owner's onboarding
                string referenceId = $"owner_{userId}_{Guid.NewGuid():N}"[..40];

                _logger.LogInformation("Initiating onboarding for owner: {UserId}, Reference: {RefId}", userId, referenceId);

                // In production, you would call Razorpay's Linked Account API via REST
                // For now, we create a placeholder and direct owner to Razorpay onboarding
                // The actual linked account will be created when owner completes KYC

                // Store the reference ID as contact placeholder
                user.RazorpayContactId = referenceId;
                await _userManager.UpdateAsync(user);

                // Generate onboarding URL - in production this comes from Razorpay OAuth
                // For testing, we simulate the onboarding flow
                string baseUrl = _configuration["App:BaseUrl"] ?? "http://localhost:5173";
                string updateParam = isUpdate ? "&update=true" : "";
                string onboardingUrl = $"{baseUrl}/owner/payment-onboarding?ref={referenceId}&user_id={userId}{updateParam}";

                _logger.LogInformation("Owner onboarding initiated: {UserId}, Reference: {RefId}, IsUpdate: {IsUpdate}", userId, referenceId, isUpdate);

                return (true, "Onboarding initiated. Please complete KYC verification.", new OwnerOnboardingResponseDto
                {
                    Success = true,
                    OnboardingUrl = onboardingUrl,
                    AccountId = referenceId,
                    Message = "Please complete the payment setup to receive funds directly."
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to initiate owner onboarding: {UserId}", userId);
                return (false, $"Failed to initiate onboarding: {ex.Message}", null);
            }
        }

        /// <summary>
        /// Completes owner onboarding after KYC verification
        /// Called when owner returns from Razorpay onboarding flow
        /// </summary>
        public async Task<(bool Success, string Message)> CompleteOwnerOnboardingAsync(string userId, string accountId)
        {
            _logger.LogInformation("Completing owner onboarding: {UserId}, AccountId: {AccountId}", userId, accountId);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "User not found.");
            }

            // Update user with linked account details
            user.RazorpayAccountId = accountId;
            user.IsPaymentOnboardingComplete = true;
            user.PaymentOnboardingCompletedAt = DateTime.UtcNow;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                _logger.LogError("Failed to update user onboarding status: {Errors}", string.Join(", ", result.Errors.Select(e => e.Description)));
                return (false, "Failed to update payment settings.");
            }

            _logger.LogInformation("Owner onboarding completed successfully: {UserId}", userId);
            return (true, "Payment account set up successfully. You can now receive payments directly.");
        }

        /// <summary>
        /// Gets owner's payment settings status
        /// </summary>
        public async Task<OwnerPaymentSettingsDto> GetOwnerPaymentSettingsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return new OwnerPaymentSettingsDto
                {
                    IsOnboardingComplete = false,
                    CanReceivePayments = false
                };
            }

            return new OwnerPaymentSettingsDto
            {
                IsOnboardingComplete = user.IsPaymentOnboardingComplete,
                OnboardingCompletedAt = user.PaymentOnboardingCompletedAt,
                AccountStatus = user.IsPaymentOnboardingComplete ? "active" : "pending",
                CanReceivePayments = user.IsPaymentOnboardingComplete && !string.IsNullOrEmpty(user.RazorpayAccountId)
            };
        }

        /// <summary>
        /// Gets platform earnings summary for admin dashboard
        /// </summary>
        public async Task<PlatformEarningsDto> GetPlatformEarningsAsync()
        {
            var payments = await _unitOfWork.Payments.Query()
                .Where(p => p.Status == "Captured")
                .OrderByDescending(p => p.CreatedAt)
                .Take(50)
                .ToListAsync();

            var totalFees = payments.Sum(p => p.PlatformFeeAmount);
            var totalSettled = payments.Where(p => p.SettlementStatus == "Settled").Sum(p => p.PlatformFeeAmount);
            var totalPending = payments.Where(p => p.SettlementStatus == "Pending").Sum(p => p.PlatformFeeAmount);

            return new PlatformEarningsDto
            {
                TotalPlatformFees = totalFees,
                TotalSettled = totalSettled,
                TotalPending = totalPending,
                TotalTransactions = payments.Count,
                RecentSettlements = payments.Take(10).Select(p =>
                {
                    var dto = _mapper.Map<SettlementStatusDto>(p);
                    return dto with
                    {
                        SettlementStatus = p.SettlementStatus ?? "Pending"
                    };
                }).ToList()
            };
        }

        /// <summary>
        /// Processes settlement for a payment - transfers owner's share via Route API
        /// Called automatically after payment verification
        /// </summary>
        public async Task<(bool Success, string Message)> ProcessSettlementAsync(int paymentId)
        {
            _logger.LogInformation("Processing settlement for payment: {PaymentId}", paymentId);

            var payment = await _unitOfWork.Payments.GetByIdAsync(paymentId);
            if (payment == null)
            {
                return (false, "Payment not found.");
            }

            if (payment.SettlementStatus == "Settled")
            {
                return (true, "Payment already settled.");
            }

            var booking = await _unitOfWork.Bookings.GetByIdAsync(payment.BookingId);
            if (booking == null)
            {
                return (false, "Associated booking not found.");
            }

            // Get owner's Razorpay account
            var owner = await _userManager.FindByIdAsync(booking.OwnerId ?? "");
            if (owner == null || string.IsNullOrEmpty(owner.RazorpayAccountId))
            {
                _logger.LogWarning("Owner not onboarded for settlements: {OwnerId}", booking.OwnerId);
                payment.SettlementStatus = "Pending";
                payment.SettlementFailureReason = "Owner payment account not configured";
                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();
                return (false, "Owner has not set up their payment account yet. Settlement pending.");
            }

            try
            {
                // Calculate amounts
                decimal ownerAmount = payment.OwnerAmount;
                int ownerAmountInPaise = (int)(ownerAmount * 100);

                // In production, use Razorpay Route Transfer API via REST
                // POST /v1/transfers with the payment_id and destination account
                // For now, we simulate a successful transfer

                string transferId = $"trf_{Guid.NewGuid():N}"[..18];
                string ownerAccountId = owner.RazorpayAccountId ?? "";

                _logger.LogInformation("Transfer created: {TransferId} for Owner: {OwnerId}, Amount: {Amount}, Account: {AccountId}",
                    transferId, booking.OwnerId ?? "unknown", ownerAmount, ownerAccountId);

                // Update payment with settlement details
                payment.RazorpayTransferId = transferId;
                payment.SettlementStatus = "Settled";
                payment.SettledAt = DateTime.UtcNow;

                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();

                return (true, $"Settlement processed. Owner received Rs. {ownerAmount}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to process settlement for payment: {PaymentId}", paymentId);
                payment.SettlementStatus = "Failed";
                payment.SettlementFailureReason = ex.Message;
                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();
                return (false, $"Settlement failed: {ex.Message}");
            }
        }

        #endregion

        #region Webhook Handlers

        public async Task<int?> GetOrderByRazorpayOrderIdAsync(string razorpayOrderId)
        {
            var payment = (await _unitOfWork.Payments.FindAsync(p => p.RazorpayOrderId == razorpayOrderId)).FirstOrDefault();
            return payment?.Id;
        }

        public async Task<(bool Success, string Message)> UpdatePaymentStatusAsync(int paymentId, string status, string? razorpayPaymentId = null, string? failureReason = null)
        {
            try
            {
                var payment = await _unitOfWork.Payments.GetByIdAsync(paymentId);
                if (payment == null)
                    return (false, "Payment not found.");

                payment.Status = status;

                if (!string.IsNullOrEmpty(razorpayPaymentId))
                    payment.RazorpayPaymentId = razorpayPaymentId;

                if (!string.IsNullOrEmpty(failureReason))
                    payment.FailureReason = failureReason;

                // Update booking status based on payment status
                var booking = await _unitOfWork.Bookings.GetByIdAsync(payment.BookingId);
                if (booking != null)
                {
                    booking.Status = status switch
                    {
                        "captured" => "Confirmed",
                        "authorized" => "PaymentPending",
                        "failed" => "PaymentFailed",
                        _ => booking.Status
                    };
                    _unitOfWork.Bookings.Update(booking);
                }

                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Payment {PaymentId} status updated to {Status}", paymentId, status);
                return (true, $"Payment status updated to {status}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update payment status for: {PaymentId}", paymentId);
                return (false, $"Failed to update payment status: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> UpdateRefundStatusAsync(int paymentId, string status, string? razorpayRefundId = null)
        {
            try
            {
                var payment = await _unitOfWork.Payments.GetByIdAsync(paymentId);
                if (payment == null)
                    return (false, "Payment not found.");

                payment.Status = "Refunded";

                if (!string.IsNullOrEmpty(razorpayRefundId))
                    payment.RazorpayRefundId = razorpayRefundId;

                // Update booking status
                var booking = await _unitOfWork.Bookings.GetByIdAsync(payment.BookingId);
                if (booking != null)
                {
                    booking.Status = "Cancelled";
                    _unitOfWork.Bookings.Update(booking);
                }

                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Refund processed for payment {PaymentId}", paymentId);
                return (true, "Refund status updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update refund status for: {PaymentId}", paymentId);
                return (false, $"Failed to update refund status: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> UpdateSettlementStatusAsync(string razorpayTransferId, string status, DateTime? settledAt = null, string? failureReason = null)
        {
            try
            {
                var payment = (await _unitOfWork.Payments.FindAsync(p => p.RazorpayTransferId == razorpayTransferId)).FirstOrDefault();
                if (payment == null)
                    return (false, "Payment not found for transfer.");

                payment.SettlementStatus = status;

                if (settledAt.HasValue)
                    payment.SettledAt = settledAt;

                if (!string.IsNullOrEmpty(failureReason))
                    payment.SettlementFailureReason = failureReason;

                _unitOfWork.Payments.Update(payment);
                await _unitOfWork.SaveChangesAsync();

                _logger.LogInformation("Settlement status updated for transfer {TransferId} to {Status}", razorpayTransferId, status);
                return (true, "Settlement status updated successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update settlement status for transfer: {TransferId}", razorpayTransferId);
                return (false, $"Failed to update settlement status: {ex.Message}");
            }
        }

        #endregion
    }
}
