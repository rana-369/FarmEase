using System.Text.Json;
using FEDomain;
using FEDomain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin,Admin")] // Strict Admin security - matches AgriConnect.Api
    public class SettingsController : ControllerBase
    {
        private readonly IUnitOfWork _unitOfWork;

        public SettingsController(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        // GET: api/settings/by-category/{category}
        [HttpGet("by-category/{category}")]
        public async Task<IActionResult> GetSettingsByCategory(string category)
        {
            var categoryLower = category.ToLower();
            var settings = await _unitOfWork.SystemSettings.FindAsync(s => s.Category.ToLower() == categoryLower);
            var setting = settings.FirstOrDefault();

            if (setting == null || string.IsNullOrEmpty(setting.JsonData))
            {
                return Ok(new { });
            }

            var jsonDocument = JsonDocument.Parse(setting.JsonData);
            return Ok(jsonDocument.RootElement);
        }

        // POST: api/settings/by-category/{category}
        [HttpPost("by-category/{category}")]
        [HttpPut("by-category/{category}")]
        public async Task<IActionResult> SaveSettingsByCategory(string category, [FromBody] JsonElement payload)
        {
            var categoryLower = category.ToLower();
            var settings = await _unitOfWork.SystemSettings.FindAsync(s => s.Category.ToLower() == categoryLower);
            var setting = settings.FirstOrDefault();

            string jsonString = JsonSerializer.Serialize(payload);

            if (setting == null)
            {
                setting = new SystemSetting
                {
                    Category = categoryLower,
                    JsonData = jsonString,
                    LastUpdated = DateTime.UtcNow
                };
                await _unitOfWork.SystemSettings.AddAsync(setting);
            }
            else
            {
                setting.JsonData = jsonString;
                setting.LastUpdated = DateTime.UtcNow;
                _unitOfWork.SystemSettings.Update(setting);
            }

            await _unitOfWork.SaveChangesAsync();
            return Ok(new { Message = $"{category} settings saved successfully!" });
        }
    }
}
