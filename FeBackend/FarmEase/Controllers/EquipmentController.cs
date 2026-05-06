using System.Security.Claims;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentController(IMachineService machineService) : ControllerBase
    {
        private readonly IMachineService _machineService = machineService;

        [HttpGet("cities")]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveCities()
        {
            var cities = await _machineService.GetActiveCitiesAsync();
            return Ok(cities);
        }

        [HttpGet("available")]
        [Authorize]
        public async Task<IActionResult> GetAvailableEquipment()
        {
            var equipment = await _machineService.GetAvailableEquipmentAsync();
            return Ok(equipment);
        }

        [HttpGet("my-listings")]
        [Authorize(Roles = "owner,admin,ADMIN")]
        public async Task<IActionResult> GetMyEquipment()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var equipment = await _machineService.GetOwnerMachinesAsync(userId);
            return Ok(equipment);
        }

        [HttpPost]
        [Authorize(Roles = "owner,OWNER,Owner")]
        public async Task<IActionResult> AddEquipment(
            [FromForm] string name, 
            [FromForm] string category, 
            [FromForm] int pricePerHour, 
            [FromForm] string? location, 
            [FromForm] string? description, 
            [FromForm] double? latitude,
            [FromForm] double? longitude,
            [FromForm] string? city,
            [FromForm] string? state,
            [FromForm] string? pincode,
            IFormFile? image)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // Input validation
            if (string.IsNullOrWhiteSpace(name) || name.Length > 100)
                return BadRequest(new { Message = "Name must be 1-100 characters." });
            
            if (string.IsNullOrWhiteSpace(category) || category.Length > 50)
                return BadRequest(new { Message = "Category must be 1-50 characters." });
            
            if (pricePerHour < 1 || pricePerHour > 1000000)
                return BadRequest(new { Message = "Price per hour must be between 1 and 1,000,000." });

            // Validate coordinates if provided
            if (latitude.HasValue && (latitude < -90 || latitude > 90))
                return BadRequest(new { Message = "Latitude must be between -90 and 90." });
            
            if (longitude.HasValue && (longitude < -180 || longitude > 180))
                return BadRequest(new { Message = "Longitude must be between -180 and 180." });

            // File upload security validation
            if (image != null)
            {
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Only JPEG, PNG, and WebP images are allowed." });
                
                if (image.Length > 5 * 1024 * 1024) // 5MB limit
                    return BadRequest(new { Message = "Image size must not exceed 5MB." });
            }

            var (success, message) = await _machineService.AddEquipmentAsync(name, category, pricePerHour, userId, image, location, description, latitude, longitude, city, state, pincode);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "owner,OWNER,Owner")]
        public async Task<IActionResult> UpdateEquipment(
            int id,
            [FromForm] string? name, 
            [FromForm] string? category, 
            [FromForm] int? pricePerHour, 
            [FromForm] string? location, 
            [FromForm] string? description, 
            [FromForm] double? latitude,
            [FromForm] double? longitude,
            [FromForm] string? city,
            [FromForm] string? state,
            [FromForm] string? pincode,
            IFormFile? image)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // Get existing equipment
            var existingMachine = await _machineService.GetByIdAsync(id);
            if (existingMachine == null) 
                return NotFound(new { Message = "Equipment not found." });

            // Verify ownership
            if (!string.Equals(existingMachine.OwnerId, userId, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { Message = "You can only update your own equipment." });

            // Input validation
            if (!string.IsNullOrWhiteSpace(name) && name.Length > 100)
                return BadRequest(new { Message = "Name must be 1-100 characters." });
            
            if (!string.IsNullOrWhiteSpace(category) && category.Length > 50)
                return BadRequest(new { Message = "Category must be 1-50 characters." });
            
            if (pricePerHour.HasValue && (pricePerHour < 1 || pricePerHour > 1000000))
                return BadRequest(new { Message = "Price per hour must be between 1 and 1,000,000." });

            // Validate coordinates if provided
            if (latitude.HasValue && (latitude < -90 || latitude > 90))
                return BadRequest(new { Message = "Latitude must be between -90 and 90." });
            
            if (longitude.HasValue && (longitude < -180 || longitude > 180))
                return BadRequest(new { Message = "Longitude must be between -180 and 180." });

            // File upload security validation
            if (image != null)
            {
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Only JPEG, PNG, and WebP images are allowed." });
                
                if (image.Length > 5 * 1024 * 1024) // 5MB limit
                    return BadRequest(new { Message = "Image size must not exceed 5MB." });
            }

            var (success, message) = await _machineService.UpdateEquipmentAsync(id, name, category, pricePerHour, image, location, description, latitude, longitude, city, state, pincode);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "owner,OWNER,Owner,admin,Admin")]
        public async Task<IActionResult> DeleteEquipment(int id)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var machine = await _machineService.GetByIdAsync(id);
            if (machine == null) 
                return NotFound(new { Message = "Equipment not found." });

            // Allow admins to delete any equipment, owners can only delete their own
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
            if (!string.Equals(userRole, "admin", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(userRole, "Admin", StringComparison.OrdinalIgnoreCase) &&
                !string.Equals(machine.OwnerId, userId, StringComparison.OrdinalIgnoreCase))
                return Unauthorized(new { Message = "You can only delete your own equipment." });

            var (success, message) = await _machineService.DeleteEquipmentAsync(id);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }
    }
}
