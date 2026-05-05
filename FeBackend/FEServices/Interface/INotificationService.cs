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

        // Email notification methods
        Task NotifyBookingCreatedAsync(string ownerEmail, string ownerName, string farmerName, string machineName, int bookingId);
        Task NotifyBookingAcceptedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, DateTime? startDate = null);
        Task NotifyBookingRejectedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, string? reason = null);
        Task NotifyBookingCompletedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, decimal totalAmount);
        Task NotifyBookingCancelledAsync(string recipientEmail, string recipientName, string machineName, int bookingId, string cancelledBy);
        Task NotifyPaymentReceivedAsync(string ownerEmail, string ownerName, string farmerName, string machineName, decimal amount);
        Task NotifyPaymentReminderAsync(string farmerEmail, string farmerName, string machineName, decimal amount, DateTime dueDate);
    }
}
