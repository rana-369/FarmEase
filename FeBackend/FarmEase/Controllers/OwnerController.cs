using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmEase.Controllers
{
    [Route("api/owner")]
    [ApiController]
    [Authorize(Roles = "owner,Owner")]
    public class OwnerController(IBookingService bookingService, IMachineService machineService) : ControllerBase
    {
        private readonly IBookingService _bookingService = bookingService;
        private readonly IMachineService _machineService = machineService;

        [HttpGet("analytics")]
        public async Task<IActionResult> GetAnalytics([FromQuery] string period = "month")
        {
            try
            {
                var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(ownerId))
                    return Unauthorized(new { Message = "User not found" });

                var analytics = await _bookingService.GetOwnerAnalyticsAsync(ownerId, period);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }

        [HttpGet("analytics/equipment-performance")]
        public async Task<IActionResult> GetEquipmentPerformance()
        {
            try
            {
                var ownerId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(ownerId))
                    return Unauthorized(new { Message = "User not found" });

                var data = await _bookingService.GetOwnerEquipmentPerformanceAsync(ownerId);
                return Ok(data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message, InnerException = ex.InnerException?.Message });
            }
        }
    }
}
