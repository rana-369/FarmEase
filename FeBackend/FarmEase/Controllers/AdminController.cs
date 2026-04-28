using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FECommon.DTO;
using FECommon.Exceptions;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin,Admin")]
    public class AdminController(
        IBookingService bookingService, 
        IMachineService machineService, 
        IUserService userService) : ControllerBase
    {
        private readonly IBookingService _bookingService = bookingService;
        private readonly IMachineService _machineService = machineService;
        private readonly IUserService _userService = userService;

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                var stats = await _bookingService.GetAdminStatsAsync();
                return Ok(stats);
            }
            catch (Exception ex)
            {
                var innerMessage = ex.InnerException?.Message ?? "No inner exception";
                System.Diagnostics.Debug.WriteLine($"AdminDashboard ERROR: {ex.Message}");
                System.Diagnostics.Debug.WriteLine($"Inner: {innerMessage}");
                System.Diagnostics.Debug.WriteLine($"Stack: {ex.StackTrace}");
                
                return StatusCode(500, new { 
                    Message = ex.Message, 
                    InnerException = innerMessage,
                    StackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            try
            {
                var users = await _userService.GetAllUsersAsync();
                return Ok(new { Count = users.Count(), Users = users.Select(u => new { u.Id, u.Email, u.FullName, u.Role }) });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            try
            {
                var result = await _bookingService.GetAllBookingsPagedAsync(page, limit, search, status);
                return Ok(new
                {
                    items = result.Items,
                    totalItems = result.TotalItems,
                    totalPages = result.TotalPages,
                    currentPage = result.CurrentPage,
                    summary = result.Summary
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message, StackTrace = ex.StackTrace });
            }
        }

        [HttpGet("machines")]
        public async Task<IActionResult> GetAllMachines([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null, [FromQuery] string? status = null)
        {
            try
            {
                var result = await _machineService.GetAllMachinesPagedAsync(page, limit, search, status);
                return Ok(new
                {
                    machines = result.Items,
                    totalItems = result.TotalItems,
                    totalPages = result.TotalPages,
                    currentPage = result.CurrentPage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpPost("machines/{id}/approve")]
        public async Task<IActionResult> ApproveMachine(int id)
        {
            var (success, message) = await _machineService.ApproveAsync(id);
            if (!success)
                return NotFound(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("machines/{id}/reject")]
        public async Task<IActionResult> RejectMachine(int id, [FromBody] RejectMachineDto model)
        {
            var (success, message) = await _machineService.RejectAsync(id, model.Reason);
            if (!success)
                return NotFound(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null, [FromQuery] string? role = null)
        {
            try
            {
                var result = await _userService.GetAllUsersPagedAsync(page, limit, search, role);
                return Ok(new
                {
                    users = result.Items,
                    totalItems = result.TotalItems,
                    totalPages = result.TotalPages,
                    currentPage = result.CurrentPage
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueByMonth()
        {
            try
            {
                var revenue = await _bookingService.GetRevenueByMonthAsync();
                return Ok(revenue);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message, StackTrace = ex.StackTrace });
            }
        }

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics([FromQuery] string period = "month")
        {
            try
            {
                var analytics = await _bookingService.GetAdminAnalyticsAsync(period);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("analytics/user-growth")]
        public async Task<IActionResult> GetUserGrowth()
        {
            try
            {
                var data = await _bookingService.GetUserGrowthAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("analytics/booking-trends")]
        public async Task<IActionResult> GetBookingTrends()
        {
            try
            {
                var data = await _bookingService.GetBookingTrendsAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("analytics/category-distribution")]
        public async Task<IActionResult> GetCategoryDistribution()
        {
            try
            {
                var data = await _bookingService.GetCategoryDistributionAsync();
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }
    }
}
