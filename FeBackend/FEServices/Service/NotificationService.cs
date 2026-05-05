using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEServices.Interface;
using Microsoft.Extensions.Logging;

namespace FEServices.Service
{
    public class NotificationService(IUnitOfWork unitOfWork, IEmailService emailService, ILogger<NotificationService> logger) : INotificationService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IEmailService _emailService = emailService;
        private readonly ILogger<NotificationService> _logger = logger;

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

        // Email Notification Implementations
        public async Task NotifyBookingCreatedAsync(string ownerEmail, string ownerName, string farmerName, string machineName, int bookingId)
        {
            try
            {
                var subject = "New Booking Request - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .content {{ color: #333; line-height: 1.6; }}
        .highlight {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }}
        .btn {{ display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin-top: 20px; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2>New Booking Request!</h2>
        <p>Hello {ownerName},</p>
        
        <div class='highlight'>
            <p><strong>{farmerName}</strong> has requested to rent your <strong>{machineName}</strong>.</p>
            <p>Booking ID: #{bookingId}</p>
        </div>
        
        <p>Please log in to your account to review and accept or reject this booking request.</p>
        
        <a href='https://your-domain.com/owner/bookings' class='btn'>View Booking</a>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(ownerEmail, subject, body);
                _logger.LogInformation("Booking created notification sent to {Email}", ownerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking created notification to {Email}", ownerEmail);
            }
        }

        public async Task NotifyBookingAcceptedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, DateTime? startDate = null)
        {
            try
            {
                var subject = "Booking Accepted! - FarmEase";
                var dateInfo = startDate.HasValue ? $"<p>Scheduled Date: <strong>{startDate.Value:MMMM dd, yyyy}</strong></p>" : "";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .success {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2 style='color: #10b981;'>✅ Booking Accepted!</h2>
        <p>Hello {farmerName},</p>
        
        <div class='success'>
            <p>Great news! Your booking for <strong>{machineName}</strong> has been <strong>ACCEPTED</strong> by the owner.</p>
            <p>Booking ID: #{bookingId}</p>
            {dateInfo}
        </div>
        
        <p>The equipment owner will contact you with pickup/delivery details. Please ensure you're prepared for the rental period.</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(farmerEmail, subject, body);
                _logger.LogInformation("Booking accepted notification sent to {Email}", farmerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking accepted notification to {Email}", farmerEmail);
            }
        }

        public async Task NotifyBookingRejectedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, string? reason = null)
        {
            try
            {
                var reasonText = !string.IsNullOrEmpty(reason) ? $"<p>Reason: <em>{reason}</em></p>" : "";
                var subject = "Booking Update - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .info {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2>Booking Update</h2>
        <p>Hello {farmerName},</p>
        
        <div class='info'>
            <p>Your booking request for <strong>{machineName}</strong> was not accepted by the owner.</p>
            <p>Booking ID: #{bookingId}</p>
            {reasonText}
        </div>
        
        <p>Don't worry! There are plenty of other equipment available. Browse our marketplace to find alternatives.</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(farmerEmail, subject, body);
                _logger.LogInformation("Booking rejected notification sent to {Email}", farmerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking rejected notification to {Email}", farmerEmail);
            }
        }

        public async Task NotifyBookingCompletedAsync(string farmerEmail, string farmerName, string machineName, int bookingId, decimal totalAmount)
        {
            try
            {
                var subject = "Rental Completed - Thank You! - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .success {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }}
        .amount {{ font-size: 24px; color: #10b981; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2 style='color: #10b981;'>🎉 Rental Completed!</h2>
        <p>Hello {farmerName},</p>
        
        <div class='success'>
            <p>Your rental of <strong>{machineName}</strong> has been marked as completed.</p>
            <p>Booking ID: #{bookingId}</p>
            <p>Total Amount: <span class='amount'>₹{totalAmount:N0}</span></p>
        </div>
        
        <p>Thank you for using FarmEase! We hope the equipment helped make your farming easier.</p>
        
        <p>Would you like to leave a review? Your feedback helps other farmers make better decisions.</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(farmerEmail, subject, body);
                _logger.LogInformation("Booking completed notification sent to {Email}", farmerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking completed notification to {Email}", farmerEmail);
            }
        }

        public async Task NotifyBookingCancelledAsync(string recipientEmail, string recipientName, string machineName, int bookingId, string cancelledBy)
        {
            try
            {
                var subject = "Booking Cancelled - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .warning {{ background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2>Booking Cancelled</h2>
        <p>Hello {recipientName},</p>
        
        <div class='warning'>
            <p>The booking for <strong>{machineName}</strong> (ID: #{bookingId}) has been cancelled by <strong>{cancelledBy}</strong>.</p>
        </div>
        
        <p>If a refund is applicable, it will be processed within 5-7 business days.</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(recipientEmail, subject, body);
                _logger.LogInformation("Booking cancelled notification sent to {Email}", recipientEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send booking cancelled notification to {Email}", recipientEmail);
            }
        }

        public async Task NotifyPaymentReceivedAsync(string ownerEmail, string ownerName, string farmerName, string machineName, decimal amount)
        {
            try
            {
                var subject = "Payment Received! - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .success {{ background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; }}
        .amount {{ font-size: 28px; color: #10b981; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2 style='color: #10b981;'>💰 Payment Received!</h2>
        <p>Hello {ownerName},</p>
        
        <div class='success'>
            <p>You have received a payment of <span class='amount'>₹{amount:N0}</span></p>
            <p>From: <strong>{farmerName}</strong></p>
            <p>Equipment: <strong>{machineName}</strong></p>
        </div>
        
        <p>The payment has been credited to your account (minus platform fees).</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(ownerEmail, subject, body);
                _logger.LogInformation("Payment received notification sent to {Email}", ownerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment received notification to {Email}", ownerEmail);
            }
        }

        public async Task NotifyPaymentReminderAsync(string farmerEmail, string farmerName, string machineName, decimal amount, DateTime dueDate)
        {
            try
            {
                var subject = "Payment Reminder - FarmEase";
                var body = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 28px; font-weight: bold; color: #10b981; }}
        .reminder {{ background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }}
        .amount {{ font-size: 24px; color: #f59e0b; font-weight: bold; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 FarmEase</div>
        </div>
        
        <h2>⏰ Payment Reminder</h2>
        <p>Hello {farmerName},</p>
        
        <div class='reminder'>
            <p>This is a friendly reminder about your upcoming payment.</p>
            <p>Equipment: <strong>{machineName}</strong></p>
            <p>Amount Due: <span class='amount'>₹{amount:N0}</span></p>
            <p>Due Date: <strong>{dueDate:MMMM dd, yyyy}</strong></p>
        </div>
        
        <p>Please ensure timely payment to avoid any inconvenience.</p>
        
        <div class='footer'>
            <p>© 2024 FarmEase - Farm Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>";

                await _emailService.SendEmailAsync(farmerEmail, subject, body);
                _logger.LogInformation("Payment reminder notification sent to {Email}", farmerEmail);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send payment reminder notification to {Email}", farmerEmail);
            }
        }
    }
}
