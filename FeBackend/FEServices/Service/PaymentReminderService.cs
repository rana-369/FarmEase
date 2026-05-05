using Microsoft.EntityFrameworkCore;
using FEDomain.Interfaces;
using FEServices.Interface;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.DependencyInjection;

namespace FEServices.Service
{
    /// <summary>
    /// Background service that sends payment reminders for accepted bookings
    /// that haven't been paid yet
    /// </summary>
    public class PaymentReminderService(
            IServiceProvider serviceProvider,
            ILogger<PaymentReminderService> logger) : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider = serviceProvider;
        private readonly ILogger<PaymentReminderService> _logger = logger;

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Payment Reminder Service started");

            // Run daily at 9:00 AM
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    var now = DateTime.UtcNow;
                    var nextRun = now.Date.AddHours(9); // 9:00 AM UTC

                    if (now > nextRun)
                    {
                        nextRun = nextRun.AddDays(1);
                    }

                    var delay = nextRun - now;
                    _logger.LogInformation("Next payment reminder check scheduled at: {NextRun}", nextRun);

                    await Task.Delay(delay, stoppingToken);

                    await SendPaymentRemindersAsync();
                }
                catch (TaskCanceledException)
                {
                    // Service is stopping
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in payment reminder service");
                    // Wait 1 hour before retrying on error
                    await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
                }
            }

            _logger.LogInformation("Payment Reminder Service stopped");
        }

        private async Task SendPaymentRemindersAsync()
        {
            _logger.LogInformation("Starting payment reminder check at: {Time}", DateTime.UtcNow);

            using var scope = _serviceProvider.CreateScope();
            var unitOfWork = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
            var notificationService = scope.ServiceProvider.GetRequiredService<INotificationService>();

            try
            {
                // Get accepted bookings without payment (older than 24 hours)
                var cutoffTime = DateTime.UtcNow.AddHours(-24);

                // Get accepted bookings older than 24 hours
                var pendingBookings = await unitOfWork.Bookings.Query()
                    .Where(b => b.Status == "Accepted" && b.CreatedAt < cutoffTime)
                    .ToListAsync();

                // Filter out already paid bookings
                var bookingIds = pendingBookings.Select(b => b.Id).ToList();
                var paidBookingIds = await unitOfWork.Payments.Query()
                    .Where(p => bookingIds.Contains(p.BookingId) && p.Status == "Captured")
                    .Select(p => p.BookingId)
                    .ToListAsync();

                var unpaidBookings = pendingBookings
                    .Where(b => !paidBookingIds.Contains(b.Id))
                    .ToList();

                _logger.LogInformation("Found {Count} bookings pending payment", unpaidBookings.Count);

                int remindersSent = 0;

                foreach (var booking in unpaidBookings)
                {
                    try
                    {
                        // Get farmer details
                        var farmer = await unitOfWork.Users.Query()
                            .AsNoTracking()
                            .FirstOrDefaultAsync(u => u.Id == booking.FarmerId);

                        if (farmer != null && !string.IsNullOrEmpty(farmer.Email))
                        {
                            // Use created date + 7 days as due date
                            var dueDate = booking.CreatedAt.AddDays(7);

                            await notificationService.NotifyPaymentReminderAsync(
                                farmer.Email,
                                farmer.FullName ?? "Farmer",
                                booking.MachineName ?? "equipment",
                                booking.TotalAmount,
                                dueDate
                            );

                            remindersSent++;
                            _logger.LogInformation("Payment reminder sent for booking {BookingId} to {Email}",
                                booking.Id, farmer.Email);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Failed to send reminder for booking {BookingId}", booking.Id);
                    }

                    // Small delay between emails to avoid rate limiting
                    await Task.Delay(100);
                }

                _logger.LogInformation("Payment reminder check completed. {Count} reminders sent.", remindersSent);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment reminders");
            }
        }
    }
}
