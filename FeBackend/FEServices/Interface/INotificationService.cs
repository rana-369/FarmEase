using FEDomain;

namespace FEServices.Interface
{
    public interface INotificationService
    {
        Task<IEnumerable<Notification>> GetUserNotificationsAsync(string userId);
        Task<IEnumerable<Notification>> GetAdminNotificationsAsync();
        Task<int> GetUnreadCountAsync(string userId);
        Task<Notification> CreateAsync(string userId, string title, string message, string type = "info");
        Task<(bool Success, string Message)> MarkAsReadAsync(int id);
        Task<(bool Success, string Message)> DeleteAsync(int id);
    }
}
