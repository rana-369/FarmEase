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
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
                
                Console.WriteLine($"\n=== ADD EQUIPMENT DEBUG ===");
                Console.WriteLine($"UserId: {userId}");
                Console.WriteLine($"UserRole: {userRole}");
                Console.WriteLine($"Name: {name}");
                Console.WriteLine($"Category: {category}");
                Console.WriteLine($"PricePerHour: {pricePerHour}");
                Console.WriteLine($"Location: {location}");
                Console.WriteLine($"Description: {description}");
                Console.WriteLine($"Image: {(image != null ? image.FileName : "null")}");
                Console.WriteLine($"===========================\n");
                
                if (userId == null) return Unauthorized();

                var (success, message) = await _machineService.AddEquipmentAsync(name, category, pricePerHour, userId, image, location, description);
                if (!success)
                {
                    Console.WriteLine($"!!! FAILED: {message}");
                    return BadRequest(new { Message = message });
                }

                Console.WriteLine($"SUCCESS: {message}");
                return Ok(new { Message = message });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n!!! EXCEPTION in AddEquipment: {ex.Message}");
                Console.WriteLine($"Stack: {ex.StackTrace}");
                return BadRequest(new { Message = ex.Message });
            }
        }
    }
}
