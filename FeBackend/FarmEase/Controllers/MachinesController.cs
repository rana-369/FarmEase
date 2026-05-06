using System.Security.Claims;
using FEDomain;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MachinesController(IMachineService machineService) : ControllerBase
    {
        private readonly IMachineService _machineService = machineService;

        [HttpGet]
        public async Task<IActionResult> GetMachines()
        {
            var machines = await _machineService.GetAllMachinesAsync();
            return Ok(machines);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMachine(int id)
        {
            var machine = await _machineService.GetByIdAsync(id);
            if (machine == null) return NotFound(new { Message = "Machine not found." });
            return Ok(machine);
        }

        [HttpGet("owner")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GetOwnerMachines()
        {
            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var machines = await _machineService.GetOwnerMachinesAsync(userId);
            return Ok(machines);
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategories()
        {
            var machines = await _machineService.GetAllMachinesAsync();
            var categories = machines
                .Where(m => !string.IsNullOrEmpty(m.Type))
                .Select(m => m.Type)
                .Distinct()
                .ToList();
            return Ok(categories);
        }

        [HttpPost]
        [Authorize(Roles = "owner,admin,Admin,Owner")]
        public async Task<IActionResult> CreateMachine([FromBody] Machine machine)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var userId = GetUserId();
            if (userId == null) return Unauthorized();

            var (success, message, createdMachine) = await _machineService.CreateAsync(machine, userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(createdMachine);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "owner,admin,Admin,Owner")]
        public async Task<IActionResult> UpdateMachine(int id, [FromBody] Machine machine)
        {
            var existingMachine = await _machineService.GetByIdAsync(id);
            if (existingMachine == null) return NotFound(new { Message = "Machine not found." });

            var userId = GetUserId();
            if (userId == null || !string.Equals(existingMachine.OwnerId, userId, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { Message = "You can only update your own machines." });

            existingMachine.Name = machine.Name;
            existingMachine.Type = machine.Type;
            existingMachine.Rate = machine.Rate;
            existingMachine.ImageUrl = machine.ImageUrl;

            var (success, message, updatedMachine) = await _machineService.CreateAsync(existingMachine, userId);
            return Ok(updatedMachine);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "owner,admin,Admin,Owner")]
        public async Task<IActionResult> DeleteMachine(int id)
        {
            var machine = await _machineService.GetByIdAsync(id);
            if (machine == null) return NotFound(new { Message = "Machine not found." });

            var userId = GetUserId();
            if (userId == null || !string.Equals(machine.OwnerId, userId, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { Message = "You can only delete your own machines." });

            return Ok(new { Message = "Machine deleted successfully." });
        }

        [HttpPut("{id}/approve")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<IActionResult> ApproveMachine(int id)
        {
            var (success, message) = await _machineService.ApproveAsync(id);
            if (!success)
                return NotFound(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}/reject")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<IActionResult> RejectMachine(int id, [FromBody] RejectMachineDto model)
        {
            var (success, message) = await _machineService.RejectAsync(id, model.Reason);
            if (!success)
                return NotFound(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpGet("{id}/availability")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEquipmentAvailability(int id, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
        {
            // Default to current month if not specified
            var start = startDate ?? DateTime.UtcNow.Date;
            var end = endDate ?? start.AddMonths(2);

            // Validate date range
            if (end < start)
                return BadRequest(new { Message = "End date must be after start date." });

            if (end > start.AddMonths(3))
                return BadRequest(new { Message = "Date range cannot exceed 3 months." });

            var availability = await _machineService.GetEquipmentAvailabilityAsync(id, start, end);
            return Ok(availability);
        }

        /// <summary>
        /// Get machines near a specific location - Like Uber/Rapido for finding nearby equipment
        /// </summary>
        [HttpGet("nearby")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMachinesNearby(
            [FromQuery] double lat, 
            [FromQuery] double lng, 
            [FromQuery] double radius = 10,
            [FromQuery] string? category = null)
        {
            // Validate coordinates
            if (lat < -90 || lat > 90)
                return BadRequest(new { Message = "Latitude must be between -90 and 90." });
            
            if (lng < -180 || lng > 180)
                return BadRequest(new { Message = "Longitude must be between -180 and 180." });

            // Validate radius (max 100km)
            if (radius <= 0 || radius > 100)
                return BadRequest(new { Message = "Radius must be between 1 and 100 km." });

            var nearbyMachines = await _machineService.GetMachinesNearbyAsync(lat, lng, radius, category);
            return Ok(nearbyMachines);
        }

        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue("uid")
                ?? User.FindFirstValue("sub")
                ?? User.Identity?.Name;
        }
    }

    public class RejectMachineDto
    {
        public string? Reason { get; set; }
    }
}
