using System.Security.Claims;
using AutoMapper;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BookingsController(IBookingService bookingService, IMapper mapper) : ControllerBase
    {
        private readonly IBookingService _bookingService = bookingService;
        private readonly IMapper _mapper = mapper;

        [HttpPost]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> CreateBooking([FromBody] CreateBookingDto request)
        {
            try
            {
                var farmerId = GetUserId();
                if (farmerId == null) return Unauthorized(new { Message = "Could not identify user from token." });

                var farmerName = User.FindFirstValue("FullName") ?? "Farmer";

                var (success, message, booking) = await _bookingService.CreateAsync(request, farmerId, farmerName);
                if (!success)
                    return BadRequest(new { Message = message });

                var bookingDto = _mapper.Map<BookingResponseDto>(booking);
                return Ok(new { Message = message, Booking = bookingDto });
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                System.Diagnostics.Debug.WriteLine($"CreateBooking ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Inner: {innerMessage}");
                System.Diagnostics.Debug.WriteLine($"Stack: {ex.StackTrace}");

                return StatusCode(500, new {
                    Message = ex.Message,
                    InnerException = innerMessage,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("owner")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GetOwnerBookings()
        {
            try
            {
                var userId = GetUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var bookings = await _bookingService.GetOwnerBookingsAsync(userId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                var stackTrace = ex.StackTrace;
                System.Diagnostics.Debug.WriteLine($"GetOwnerBookings ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Inner: {innerMessage}");
                System.Diagnostics.Debug.WriteLine($"Stack: {stackTrace}");
                
                return StatusCode(500, new { 
                    Message = ex.Message, 
                    InnerException = innerMessage,
                    StackTrace = stackTrace
                });
            }
        }

        [HttpGet("farmer")]
        [Authorize(Roles = "farmer")]
        public async Task<IActionResult> GetFarmerBookings()
        {
            try
            {
                var userId = GetUserId();
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var bookings = await _bookingService.GetFarmerBookingsAsync(userId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                // Log the full exception details
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                var stackTrace = ex.StackTrace;
                System.Diagnostics.Debug.WriteLine($"GetFarmerBookings ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Inner: {innerMessage}");
                System.Diagnostics.Debug.WriteLine($"Stack: {stackTrace}");
                
                return StatusCode(500, new { 
                    Message = ex.Message, 
                    InnerException = innerMessage,
                    StackTrace = stackTrace
                });
            }
        }

        [HttpPut("{id}/accept")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> AcceptBooking(int id)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.AcceptAsync(id, userId ?? "");
            if (!success)
                return Unauthorized(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> RejectBooking(int id)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.RejectAsync(id, userId ?? "");
            if (!success)
                return Unauthorized(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("{id}/generate-arrival-otp")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GenerateArrivalOtp(int id)
        {
            var userId = GetUserId();
            var (success, message, otp) = await _bookingService.GenerateArrivalOtpAsync(id, userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, Otp = otp });
        }

        [HttpPost("{id}/verify-arrival-otp")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> VerifyArrivalOtp(int id, [FromBody] VerifyOtpDto model)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.VerifyArrivalOtpAsync(id, model.Otp ?? "", userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("{id}/generate-workstart-otp")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GenerateWorkStartOtp(int id)
        {
            var userId = GetUserId();
            var (success, message, otp) = await _bookingService.GenerateWorkStartOtpAsync(id, userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, Otp = otp });
        }

        [HttpPost("{id}/verify-workstart-otp")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> VerifyWorkStartOtp(int id, [FromBody] VerifyOtpDto model)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.VerifyWorkStartOtpAsync(id, model.Otp ?? "", userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}/complete")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> CompleteBooking(int id)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.CompleteAsync(id, userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = "Owner,owner,Admin,admin")]
        public async Task<IActionResult> UpdateBookingStatus(int id, [FromBody] UpdateBookingStatusDto model)
        {
            var userId = GetUserId();

            var (success, message) = model.Status?.ToLower() switch
            {
                "accepted" or "accept" => await _bookingService.AcceptAsync(id, userId ?? ""),
                "rejected" or "reject" => await _bookingService.RejectAsync(id, userId ?? ""),
                "completed" or "complete" => await _bookingService.CompleteAsync(id, userId ?? ""),
                "paid" or "pay" => await _bookingService.PayAsync(id, userId ?? ""),
                _ => (false, "Invalid status. Use: accepted, rejected, completed, or paid.")
            };

            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpDelete("{id}/cancel")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.CancelAsync(id, userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}/pay")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> PayBooking(int id)
        {
            var userId = GetUserId();
            var (success, message) = await _bookingService.PayAsync(id, userId ?? "");
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpGet("owner/sync-stats")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GetOwnerDashboardStatsSynced()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "Could not identify user from token." });

            var stats = await _bookingService.GetOwnerDashboardStatsAsync(userId);
            return Ok(stats);
        }

        [HttpGet("farmer/stats")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> GetFarmerStats()
        {
            var userId = GetUserId();
            if (userId == null)
                return Unauthorized(new { Message = "Could not identify user from token." });

            var stats = await _bookingService.GetFarmerStatsAsync(userId);
            return Ok(stats);
        }

        [HttpGet("admin/all")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetAllAdminBookings()
        {
            var bookings = await _bookingService.GetAllBookingsAsync();
            return Ok(bookings);
        }

        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Name)
                ?? User.FindFirstValue("uid");
        }
    }
}
