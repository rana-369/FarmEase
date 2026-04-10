using System.Security.Claims;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EquipmentController : ControllerBase
    {
        private readonly IMachineService _machineService;

        public EquipmentController(IMachineService machineService)
        {
            _machineService = machineService;
        }

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
        public async Task<IActionResult> AddEquipment([FromForm] string name, [FromForm] string category, [FromForm] int pricePerHour, [FromForm] string? location, [FromForm] string? description, IFormFile? image)
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

            // File upload security validation
            if (image != null)
            {
                var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/webp" };
                if (!allowedTypes.Contains(image.ContentType, StringComparer.OrdinalIgnoreCase))
                    return BadRequest(new { Message = "Only JPEG, PNG, and WebP images are allowed." });
                
                if (image.Length > 5 * 1024 * 1024) // 5MB limit
                    return BadRequest(new { Message = "Image size must not exceed 5MB." });
            }

            var (success, message) = await _machineService.AddEquipmentAsync(name, category, pricePerHour, userId, image, location, description);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }
    }
}
