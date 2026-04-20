using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEServices.Interface;

namespace FEServices.Service
{
    public class NotificationService : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public NotificationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId)
        {
            var allNotifications = await _unitOfWork.Notifications.GetAllAsync();
            return allNotifications
                .Where(n => string.Equals(n.UserId?.Trim(), userId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(n => n.CreatedAt)
                .Take(50);
        }

        public async Task<IEnumerable<Notification>> GetAdminNotificationsAsync()
        {
            return await _unitOfWork.Notifications.FindAsync(n => 
                n.UserId == "admin" || string.IsNullOrEmpty(n.UserId));
        }

        public async Task<int> GetUnreadCountAsync(string userId)
        {
            return await _unitOfWork.Notifications.CountAsync(n => 
                n.UserId == userId && !n.IsRead);
        }

        public async Task<Notification> CreateAsync(string userId, string title, string message, string type = "info")
        {
            var notification = new Notification
            {
                UserId = userId,
                Title = title,
                Message = message,
                Type = type,
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return notification;
        }

        public async Task<(bool Success, string Message)> MarkAsReadAsync(int id)
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(id);
            if (notification == null) return (false, "Notification not found.");

            notification.IsRead = true;
            _unitOfWork.Notifications.Update(notification);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Notification marked as read.");
        }

        public async Task<(bool Success, string Message)> DeleteAsync(int id)
        {
            var notification = await _unitOfWork.Notifications.GetByIdAsync(id);
            if (notification == null) return (false, "Notification not found.");

            _unitOfWork.Notifications.Delete(notification);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Notification deleted.");
        }
    }
}
