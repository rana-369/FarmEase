using System.Security.Claims;
using System.Text.Json;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IBookingService _bookingService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentsController> _logger;

        public PaymentsController(
            IPaymentService paymentService,
            IBookingService bookingService,
            IConfiguration configuration,
            ILogger<PaymentsController> logger)
        {
            _paymentService = paymentService;
            _bookingService = bookingService;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            // Verify the user is the farmer who made this booking
            var booking = await _bookingService.GetByIdAsync(model.BookingId);
            if (booking == null)
                return NotFound(new { Message = "Booking not found." });

            if (booking.FarmerId != userId)
                return Forbid("Only the farmer who made the booking can initiate payment.");

            var (success, message, orderData) = await _paymentService.CreateOrderAsync(model.BookingId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(orderData);
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            // Verify the user is the farmer who made this booking
            var booking = await _bookingService.GetByIdAsync(model.BookingId);
            if (booking == null)
                return NotFound(new { Message = "Booking not found." });

            if (booking.FarmerId != userId)
                return Forbid("Only the farmer who made the booking can verify payment.");

            var (success, message) = await _paymentService.VerifyPaymentAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("refund/{bookingId}")]
        [Authorize(Roles = "Admin,admin,Owner,owner")]
        public async Task<IActionResult> Refund(int bookingId, [FromQuery] string? reason = null)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userRole = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            // Admins can refund any booking, owners can only refund their own bookings
            if (!string.Equals(userRole, "admin", StringComparison.OrdinalIgnoreCase))
            {
                var booking = await _bookingService.GetByIdAsync(bookingId);
                if (booking == null)
                    return NotFound(new { Message = "Booking not found." });

                if (booking.OwnerId != userId)
                    return Forbid("You can only refund bookings for your own machines.");
            }

            var (success, message, refundData) = await _paymentService.RefundAsync(bookingId, reason);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, RefundData = refundData });
        }

        #region Owner Payment Settings (Route API)

        /// <summary>
        /// Get current owner's payment settings status
        /// </summary>
        [HttpGet("owner/settings")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GetOwnerPaymentSettings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var settings = await _paymentService.GetOwnerPaymentSettingsAsync(userId);
            return Ok(settings);
        }

        /// <summary>
        /// Initiate Razorpay onboarding for owner to receive payments directly
        /// </summary>
        [HttpPost("owner/onboarding")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> InitiateOwnerOnboarding()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message, data) = await _paymentService.InitiateOwnerOnboardingAsync(userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, Data = data });
        }

        /// <summary>
        /// Complete owner onboarding after KYC verification
        /// Called when owner returns from Razorpay onboarding flow
        /// </summary>
        [HttpPost("owner/onboarding/complete")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> CompleteOwnerOnboarding([FromBody] CompleteOnboardingDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message) = await _paymentService.CompleteOwnerOnboardingAsync(userId, model.AccountId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        #endregion

        #region Admin - Platform Earnings

        /// <summary>
        /// Get platform earnings summary for admin dashboard
        /// </summary>
        [HttpGet("admin/earnings")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetPlatformEarnings()
        {
            var earnings = await _paymentService.GetPlatformEarningsAsync();
            return Ok(earnings);
        }

        /// <summary>
        /// Manually process pending settlement for a payment
        /// </summary>
        [HttpPost("admin/settlements/{paymentId}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> ProcessSettlement(int paymentId)
        {
            var (success, message) = await _paymentService.ProcessSettlementAsync(paymentId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        #endregion

        #region Razorpay Webhooks

        /// <summary>
        /// Handle Razorpay webhooks for real-time payment updates
        /// This endpoint is called by Razorpay servers - no auth required
        /// </summary>
        [HttpPost("webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleWebhook()
        {
            try
            {
                // Read raw body for signature verification
                using var reader = new StreamReader(Request.Body);
                var requestBody = await reader.ReadToEndAsync();

                // Verify webhook signature
                var razorpaySignature = Request.Headers["X-Razorpay-Signature"].FirstOrDefault();
                var webhookSecret = _configuration["Razorpay:WebhookSecret"];

                if (string.IsNullOrEmpty(razorpaySignature) || string.IsNullOrEmpty(webhookSecret))
                {
                    _logger.LogWarning("Webhook received without signature or secret not configured");
                    return Unauthorized(new { Message = "Invalid webhook signature" });
                }

                // Verify signature using HMAC-SHA256
                var isValidSignature = VerifyWebhookSignature(requestBody, razorpaySignature, webhookSecret);
                if (!isValidSignature)
                {
                    _logger.LogWarning("Invalid webhook signature received");
                    return Unauthorized(new { Message = "Invalid webhook signature" });
                }

                // Parse webhook payload
                var webhookPayload = JsonSerializer.Deserialize<RazorpayWebhookPayload>(requestBody, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (webhookPayload == null || string.IsNullOrEmpty(webhookPayload.Event))
                {
                    return BadRequest(new { Message = "Invalid webhook payload" });
                }

                _logger.LogInformation("Webhook received: {Event}", webhookPayload.Event);

                // Handle different webhook events
                var (success, message) = webhookPayload.Event switch
                {
                    "payment.authorized" => await HandlePaymentAuthorizedAsync(webhookPayload),
                    "payment.captured" => await HandlePaymentCapturedAsync(webhookPayload),
                    "payment.failed" => await HandlePaymentFailedAsync(webhookPayload),
                    "refund.processed" => await HandleRefundProcessedAsync(webhookPayload),
                    "transfer.settled" => await HandleTransferSettledAsync(webhookPayload),
                    "transfer.failed" => await HandleTransferFailedAsync(webhookPayload),
                    _ => (true, $"Event {webhookPayload.Event} not handled")
                };

                if (!success)
                {
                    _logger.LogError("Webhook processing failed: {Message}", message);
                    return BadRequest(new { Message = message });
                }

                _logger.LogInformation("Webhook processed successfully: {Event}", webhookPayload.Event);
                return Ok(new { Message = "Webhook processed successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing webhook");
                return StatusCode(500, new { Message = "Internal server error processing webhook" });
            }
        }

        private bool VerifyWebhookSignature(string payload, string signature, string secret)
        {
            try
            {
                using var hmac = new System.Security.Cryptography.HMACSHA256(System.Text.Encoding.UTF8.GetBytes(secret));
                var hash = hmac.ComputeHash(System.Text.Encoding.UTF8.GetBytes(payload));
                var computedSignature = Convert.ToHexString(hash).ToLower();
                return computedSignature == signature.ToLower();
            }
            catch
            {
                return false;
            }
        }

        private async Task<(bool Success, string Message)> HandlePaymentAuthorizedAsync(RazorpayWebhookPayload payload)
        {
            var payment = payload.Payload?.Payment;
            if (payment == null) return (false, "Invalid payment payload");

            // Find the payment by Razorpay order ID
            var paymentId = await _paymentService.GetOrderByRazorpayOrderIdAsync(payment.OrderId);
            if (paymentId == null) return (false, "Order not found");

            // Update payment status
            return await _paymentService.UpdatePaymentStatusAsync(
                paymentId.Value,
                "authorized",
                payment.RazorpayPaymentId
            );
        }

        private async Task<(bool Success, string Message)> HandlePaymentCapturedAsync(RazorpayWebhookPayload payload)
        {
            var payment = payload.Payload?.Payment;
            if (payment == null) return (false, "Invalid payment payload");

            // Find payment by Razorpay order ID
            var paymentId = await _paymentService.GetOrderByRazorpayOrderIdAsync(payment.OrderId);
            if (paymentId == null) return (false, "Order not found");

            return await _paymentService.UpdatePaymentStatusAsync(
                paymentId.Value,
                "captured",
                payment.RazorpayPaymentId
            );
        }

        private async Task<(bool Success, string Message)> HandlePaymentFailedAsync(RazorpayWebhookPayload payload)
        {
            var payment = payload.Payload?.Payment;
            if (payment == null) return (false, "Invalid payment payload");

            // Find payment by Razorpay order ID
            var paymentId = await _paymentService.GetOrderByRazorpayOrderIdAsync(payment.OrderId);
            if (paymentId == null) return (false, "Order not found");

            return await _paymentService.UpdatePaymentStatusAsync(
                paymentId.Value,
                "failed",
                payment.RazorpayPaymentId,
                payment.ErrorDescription
            );
        }

        private async Task<(bool Success, string Message)> HandleRefundProcessedAsync(RazorpayWebhookPayload payload)
        {
            var refund = payload.Payload?.Refund;
            if (refund == null) return (false, "Invalid refund payload");

            if (!int.TryParse(refund.EntityId, out var paymentId))
                return (false, "Invalid payment ID in refund payload");

            return await _paymentService.UpdateRefundStatusAsync(
                paymentId,
                "processed",
                refund.RazorpayRefundId
            );
        }

        private async Task<(bool Success, string Message)> HandleTransferSettledAsync(RazorpayWebhookPayload payload)
        {
            var transfer = payload.Payload?.Transfer;
            if (transfer == null) return (false, "Invalid transfer payload");

            // Update settlement status - money has reached owner's bank
            return await _paymentService.UpdateSettlementStatusAsync(
                transfer.RazorpayTransferId,
                "settled",
                DateTime.UtcNow
            );
        }

        private async Task<(bool Success, string Message)> HandleTransferFailedAsync(RazorpayWebhookPayload payload)
        {
            var transfer = payload.Payload?.Transfer;
            if (transfer == null) return (false, "Invalid transfer payload");

            return await _paymentService.UpdateSettlementStatusAsync(
                transfer.RazorpayTransferId,
                "failed",
                null,
                transfer.ErrorDescription
            );
        }

        #endregion
    }

    // Webhook payload models
    public class RazorpayWebhookPayload
    {
        public string Event { get; set; } = string.Empty;
        public WebhookPayloadData? Payload { get; set; }
    }

    public class WebhookPayloadData
    {
        public RazorpayWebhookPayment? Payment { get; set; }
        public RazorpayWebhookRefund? Refund { get; set; }
        public RazorpayWebhookTransfer? Transfer { get; set; }
    }

    public class RazorpayWebhookPayment
    {
        public string EntityId { get; set; } = string.Empty; // Our payment ID
        public string OrderId { get; set; } = string.Empty; // Razorpay order ID
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string? ErrorDescription { get; set; }
    }

    public class RazorpayWebhookRefund
    {
        public string EntityId { get; set; } = string.Empty; // Our payment ID
        public string RazorpayRefundId { get; set; } = string.Empty;
    }

    public class RazorpayWebhookTransfer
    {
        public string RazorpayTransferId { get; set; } = string.Empty;
        public string? ErrorDescription { get; set; }
    }

    // DTO for complete onboarding
    public class CompleteOnboardingDto
    {
        public string AccountId { get; set; } = string.Empty;
    }

}
