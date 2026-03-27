using System.Security.Cryptography;
using System.Text;
using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.Extensions.Configuration;
using Razorpay.Api;
using PaymentEntity = FEDomain.Payment;

namespace FEServices.Service
{
    public class PaymentService : IPaymentService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IConfiguration _configuration;

        public PaymentService(IUnitOfWork unitOfWork, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _configuration = configuration;
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

                Console.WriteLine($"\n=== RAZORPAY DEBUG ===");
                Console.WriteLine($"KeyId: {keyId}");
                Console.WriteLine($"KeySecret: {keySecret.Substring(0, 4)}..."); // Only show first 4 chars
                Console.WriteLine($"Amount: {amountInPaise} paise");
                Console.WriteLine($"BookingId: {bookingId}");
                Console.WriteLine($"======================\n");

                var client = new RazorpayClient(keyId, keySecret);

                var options = new Dictionary<string, object>
                {
                    { "amount", amountInPaise },
                    { "currency", "INR" },
                    { "receipt", $"rcpt_{booking.Id}" }
                };

                Order order = client.Order.Create(options);
                string orderId = order["id"].ToString();

                Console.WriteLine($"Order created successfully: {orderId}");

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
                Console.WriteLine($"\n!!! RAZORPAY ERROR: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}\n");
                return (false, $"Failed to initiate payment gateway. Error: {ex.Message}", null);
            }
        }

        public async Task<(bool Success, string Message)> VerifyPaymentAsync(VerifyPaymentDto model)
        {
            Console.WriteLine($"\n=== VERIFY PAYMENT DEBUG ===");
            Console.WriteLine($"BookingId: {model.BookingId}");
            Console.WriteLine($"RazorpayOrderId: {model.RazorpayOrderId}");
            Console.WriteLine($"RazorpayPaymentId: {model.RazorpayPaymentId}");
            Console.WriteLine($"RazorpaySignature: {model.RazorpaySignature}");
            
            string secret = _configuration["Razorpay:Secret"] ?? "";

            string generatedSignature = GenerateRazorpaySignature(model.RazorpayOrderId, model.RazorpayPaymentId, secret);
            
            Console.WriteLine($"Generated Signature: {generatedSignature}");
            Console.WriteLine($"Match: {generatedSignature == model.RazorpaySignature}");

            if (generatedSignature != model.RazorpaySignature)
            {
                Console.WriteLine("!!! Signature mismatch!");
                return (false, "Payment verification failed. Invalid signature detected.");
            }

            var booking = await _unitOfWork.Bookings.GetByIdAsync(model.BookingId);
            if (booking == null)
            {
                Console.WriteLine("!!! Booking not found!");
                return (false, "Booking not found.");
            }

            Console.WriteLine($"Booking found: {booking.Id}, Status: {booking.Status}");
            
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
            
            Console.WriteLine($"SaveChanges result: {saveResult}");
            Console.WriteLine($"Booking status after save: {booking.Status}");
            Console.WriteLine($"Payment saved with ID: {payment.Id}");
            Console.WriteLine($"=============================\n");

            return (true, "Payment successful! Booking is now Active.");
        }

        public async Task<(bool Success, string Message, object? RefundData)> RefundAsync(int bookingId, string? reason = null)
        {
            Console.WriteLine($"\n=== REFUND DEBUG ===");
            Console.WriteLine($"BookingId: {bookingId}");
            Console.WriteLine($"Reason: {reason}");
            
            var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);
            if (booking == null)
            {
                Console.WriteLine("!!! Booking not found!");
                return (false, "Booking not found.", null);
            }

            // Find the payment for this booking
            var payments = await _unitOfWork.Payments.GetAllAsync();
            var payment = payments.FirstOrDefault(p => p.BookingId == bookingId && p.Status == "Captured");
            
            if (payment == null)
            {
                Console.WriteLine("!!! No captured payment found for this booking.");
                return (false, "No payment found for refund.", null);
            }

            // Check if already refunded
            if (payment.Status == "Refunded")
            {
                Console.WriteLine("!!! Payment already refunded.");
                return (false, "Payment already refunded.", null);
            }

            // Validate booking status for refund
            if (booking.Status != "Active" && booking.Status != "Accepted")
            {
                Console.WriteLine($"!!! Cannot refund booking with status: {booking.Status}");
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

                Console.WriteLine($"Refund created successfully: {refundId}");

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

                Console.WriteLine($"Refund processed successfully for booking {bookingId}");
                Console.WriteLine($"=============================\n");

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
                Console.WriteLine($"\n!!! REFUND ERROR: {ex.Message}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}\n");
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
