using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using FEServices.Interface;

namespace FEServices.Service;

/// <summary>
/// Background service that runs scheduled database backups
/// </summary>
public class BackupSchedulerService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IConfiguration _configuration;
    private readonly ILogger<BackupSchedulerService> _logger;
    private readonly TimeSpan _fullBackupInterval;
    private readonly TimeSpan _diffBackupInterval;
    private readonly TimeSpan _logBackupInterval;
    private readonly int _retentionDays;

    public BackupSchedulerService(
        IServiceProvider serviceProvider,
        IConfiguration configuration,
        ILogger<BackupSchedulerService> logger)
    {
        _serviceProvider = serviceProvider;
        _configuration = configuration;
        _logger = logger;

        // Configure intervals from settings (defaults: Full=24h, Diff=6h, Log=15min)
        _fullBackupInterval = TimeSpan.FromHours(
            configuration.GetValue("BackupSettings:FullBackupIntervalHours", 24));
        _diffBackupInterval = TimeSpan.FromHours(
            configuration.GetValue("BackupSettings:DiffBackupIntervalHours", 6));
        _logBackupInterval = TimeSpan.FromMinutes(
            configuration.GetValue("BackupSettings:LogBackupIntervalMinutes", 15));
        _retentionDays = configuration.GetValue("BackupSettings:RetentionDays", 30);
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Backup Scheduler Service started. Full: {Full}h, Diff: {Diff}h, Log: {Log}min, Retention: {Retention} days",
            _fullBackupInterval.TotalHours,
            _diffBackupInterval.TotalHours,
            _logBackupInterval.TotalMinutes,
            _retentionDays);

        var lastFullBackup = DateTime.MinValue;
        var lastDiffBackup = DateTime.MinValue;
        var lastLogBackup = DateTime.MinValue;
        var lastCleanup = DateTime.MinValue;

        // Check every minute
        var checkInterval = TimeSpan.FromMinutes(1);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var now = DateTime.UtcNow;

                using var scope = _serviceProvider.CreateScope();
                var backupService = scope.ServiceProvider.GetRequiredService<IDatabaseBackupService>();

                // Full backup (daily at configured time, default 2 AM)
                var fullBackupTime = _configuration.GetValue("BackupSettings:FullBackupTime", "02:00");
                var fullBackupHour = int.Parse(fullBackupTime.Split(':')[0]);
                
                if (now.Hour == fullBackupHour && now.Minute == 0 && (now - lastFullBackup).TotalHours >= 23)
                {
                    _logger.LogInformation("Starting scheduled full backup");
                    var (success, message, path) = await backupService.CreateFullBackupAsync();
                    if (success)
                    {
                        lastFullBackup = now;
                        _logger.LogInformation("Scheduled full backup completed: {Message}", message);
                    }
                    else
                    {
                        _logger.LogError("Scheduled full backup failed: {Message}", message);
                    }
                }

                // Differential backup (every 6 hours)
                if ((now - lastDiffBackup).TotalHours >= _diffBackupInterval.TotalHours && 
                    (now - lastFullBackup).TotalMinutes > 30) // At least 30 min after full backup
                {
                    _logger.LogInformation("Starting scheduled differential backup");
                    var (success, message, path) = await backupService.CreateDifferentialBackupAsync();
                    if (success)
                    {
                        lastDiffBackup = now;
                        _logger.LogInformation("Scheduled differential backup completed: {Message}", message);
                    }
                    else
                    {
                        _logger.LogWarning("Scheduled differential backup failed: {Message}", message);
                    }
                }

                // Transaction log backup (every 15 minutes)
                if ((now - lastLogBackup).TotalMinutes >= _logBackupInterval.TotalMinutes)
                {
                    var (success, message, path) = await backupService.CreateTransactionLogBackupAsync();
                    if (success)
                    {
                        lastLogBackup = now;
                        _logger.LogDebug("Transaction log backup completed: {Message}", message);
                    }
                    else
                    {
                        _logger.LogWarning("Transaction log backup failed: {Message}", message);
                    }
                }

                // Cleanup old backups (daily at 3 AM)
                if (now.Hour == 3 && now.Minute == 0 && (now - lastCleanup).TotalHours >= 23)
                {
                    _logger.LogInformation("Starting backup cleanup. Retention: {Days} days", _retentionDays);
                    await backupService.CleanupOldBackupsAsync(_retentionDays);
                    lastCleanup = now;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in backup scheduler");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }

        _logger.LogInformation("Backup Scheduler Service stopped");
    }
}
