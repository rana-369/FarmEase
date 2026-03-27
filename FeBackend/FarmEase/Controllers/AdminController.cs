using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using FECommon.DTO;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin,Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        private readonly IMachineService _machineService;
        private readonly IUserService _userService;

        public AdminController(IBookingService bookingService, IMachineService machineService, IUserService userService)
        {
            _bookingService = bookingService;
            _machineService = machineService;
            _userService = userService;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _bookingService.GetAdminStatsAsync();
            return Ok(stats);
        }

        [HttpGet("test-db")]
        public async Task<IActionResult> TestDatabase()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(new { Count = users.Count(), Users = users.Select(u => new { u.Id, u.Email, u.FullName, u.Role }) });
        }

        [HttpGet("bookings")]
        public async Task<IActionResult> GetAllBookings([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null, [FromQuery] string? status = null)
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

        [HttpGet("machines")]
        public async Task<IActionResult> GetAllMachines([FromQuery] int page = 1, [FromQuery] int limit = 10, [FromQuery] string? search = null, [FromQuery] string? status = null)
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
            var result = await _userService.GetAllUsersPagedAsync(page, limit, search, role);
            return Ok(new
            {
                users = result.Items,
                totalItems = result.TotalItems,
                totalPages = result.TotalPages,
                currentPage = result.CurrentPage
            });
        }

        [HttpGet("revenue")]
        public async Task<IActionResult> GetRevenueByMonth()
        {
            var revenue = await _bookingService.GetRevenueByMonthAsync();
            return Ok(revenue);
        }
    }
}
