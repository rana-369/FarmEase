using System.Security.Claims;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;
        private readonly IBookingService _bookingService;

        public PaymentsController(IPaymentService paymentService, IBookingService bookingService)
        {
            _paymentService = paymentService;
            _bookingService = bookingService;
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
    }
}
