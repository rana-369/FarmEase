using System.Security.Claims;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        [HttpGet("admin")]
        [Authorize(Roles = "admin,Admin")]
        public async Task<IActionResult> GetAdminNotifications()
        {
            var notifications = await _notificationService.GetAdminNotificationsAsync();
            return Ok(notifications);
        }

        [HttpGet("user-notifications")]
        public async Task<IActionResult> GetUserNotifications()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("uid")?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();

            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        [HttpPost]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationCreateDto model)
        {
            var notification = await _notificationService.CreateAsync(model.UserId, model.Title, model.Message, model.Type ?? "info");
            return Ok(notification);
        }

        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var (success, message) = await _notificationService.MarkAsReadAsync(id);
            if (!success)
                return NotFound(new { Message = message });

            return Ok();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var (success, message) = await _notificationService.DeleteAsync(id);
            if (!success)
                return NotFound(new { Message = message });

            return Ok();
        }
    }

    public class NotificationCreateDto
    {
        public string UserId { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? Type { get; set; }
    }
}
