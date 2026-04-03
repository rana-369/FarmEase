using System.Security.Cryptography;
using System.Text;
using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Razorpay.Api;
using PaymentEntity = FEDomain.Payment;

namespace FEServices.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<PaymentService> logger)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<(bool Success, string Message, object? OrderData)> CreateOrderAsync(int bookingId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);

            if (booking == null)
                return (false, "Booking not found.", null);

            if (booking.Status != "Accepted" && booking.Status != "Confirmed")
                return (false, "Booking must be accepted before payment.", null);

            int amountInPaise = (int)(booking.TotalAmount * 100);

            try
            {
                string keyId = _configuration["Razorpay:Key"] ?? throw new Exception("Razorpay Key is missing");
                string keySecret = _configuration["Razorpay:Secret"] ?? throw new Exception("Razorpay Secret is missing");

                _logger.LogInformation("Creating Razorpay order for BookingId: {BookingId}, Amount: {Amount}", bookingId, amountInPaise);

                var client = new RazorpayClient(keyId, keySecret);

                var options = new Dictionary<string, object>
                {
                    { "amount", amountInPaise },
                    { "currency", "INR" },
                    { "receipt", $"rcpt_{booking.Id}" }
                };

                Order order = client.Order.Create(options);
                string orderId = order["id"].ToString();

                _logger.LogInformation("Order created successfully: {OrderId}", orderId);

                return (true, "Order created.", new
                {
                    OrderId = orderId,
                    Amount = booking.TotalAmount,
                    Currency = "INR",
                    KeyId = keyId
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
            
            // Save payment details
            var payment = new PaymentEntity
            {
                BookingId = booking.Id,
                RazorpayOrderId = model.RazorpayOrderId,
                RazorpayPaymentId = model.RazorpayPaymentId,
                RazorpaySignature = model.RazorpaySignature,
                Amount = booking.TotalAmount,
                Currency = "INR",
                Status = "Captured",
                CreatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Payments.AddAsync(payment);
            
            booking.Status = "Active";
            _unitOfWork.Bookings.Update(booking);

            var notification = new Notification
            {
                UserId = booking.OwnerId,
                Title = "Payment Received",
                Message = $"Payment successful! The rental for {booking.MachineName} is now ACTIVE.",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            var saveResult = await _unitOfWork.SaveChangesAsync();
            
            _logger.LogInformation("Payment verified successfully for BookingId: {BookingId}", booking.Id);

            return (true, "Payment successful! Booking is now Active.");
        }

        public async Task<(bool Success, string Message, object? RefundData)> RefundAsync(int bookingId, string? reason = null)
        {
            _logger.LogInformation("Refunding payment for BookingId: {BookingId}, Reason: {Reason}", bookingId, reason);
            
            var booking = await _unitOfWork.Bookings.Query()
                .AsNoTracking()
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
                    { "amount", (int)(payment.Amount * 100) }, // Convert to paise
                    { "notes", new Dictionary<string, string> { { "reason", reason ?? "Booking cancelled" } } }
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
                    UserId = booking.FarmerId,
                    Title = "Refund Processed",
                    Message = $"Your payment of ₹{payment.Amount} for {booking.MachineName} has been refunded.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                var ownerNotification = new Notification
                {
                    UserId = booking.OwnerId,
                    Title = "Booking Cancelled & Refunded",
                    Message = $"Booking for {booking.MachineName} has been cancelled. Payment refunded to farmer.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(farmerNotification);
                await _unitOfWork.Notifications.AddAsync(ownerNotification);
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

        private string GenerateRazorpaySignature(string orderId, string paymentId, string secret)
        {
            string payload = orderId + "|" + paymentId;

            using (var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret)))
            {
                byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(payload));
                return BitConverter.ToString(hash).Replace("-", "").ToLower();
            }
        }
    }
}
