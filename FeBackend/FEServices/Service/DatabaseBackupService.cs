using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace FEServices.Service;

/// <summary>
/// Automated database backup service with point-in-time recovery support
/// </summary>
public interface IDatabaseBackupService
{
    Task<(bool Success, string Message, string? BackupPath)> CreateFullBackupAsync();
    Task<(bool Success, string Message, string? BackupPath)> CreateDifferentialBackupAsync();
    Task<(bool Success, string Message, string? BackupPath)> CreateTransactionLogBackupAsync();
    Task<IEnumerable<BackupInfo>> GetBackupHistoryAsync();
    Task<(bool Success, string Message)> RestoreBackupAsync(string backupPath, bool withRecovery = true);
    Task CleanupOldBackupsAsync(int retentionDays = 30);
}

public class DatabaseBackupService : IDatabaseBackupService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<DatabaseBackupService> _logger;
    private readonly string _connectionString;
    private readonly string _backupDirectory;
    private readonly string _databaseName;

    public DatabaseBackupService(IConfiguration configuration, ILogger<DatabaseBackupService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        _connectionString = configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string not found");
        
        // Extract database name from connection string
        var builder = new Microsoft.Data.SqlClient.SqlConnectionStringBuilder(_connectionString);
        _databaseName = builder.InitialCatalog ?? "FarmEaseDB";
        
        // Backup directory - can be overridden via configuration
        _backupDirectory = configuration["BackupSettings:Directory"] 
            ?? Path.Combine(Directory.GetCurrentDirectory(), "backups");
        
        Directory.CreateDirectory(_backupDirectory);
    }

    public async Task<(bool Success, string Message, string? BackupPath)> CreateFullBackupAsync()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"{_databaseName}_Full_{timestamp}.bak";
            var backupPath = Path.Combine(_backupDirectory, backupFileName);

            _logger.LogInformation("Starting full backup of {Database} to {Path}", _databaseName, backupPath);

            using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
            await connection.OpenAsync();

            var backupCommand = $@"
                BACKUP DATABASE [{_databaseName}] 
                TO DISK = '{backupPath}'
                WITH FORMAT,
                     MEDIANAME = 'FarmEaseBackup',
                     NAME = 'Full Backup of {_databaseName}',
                     COMPRESSION,
                     STATS = 10";

            using var command = new Microsoft.Data.SqlClient.SqlCommand(backupCommand, connection);
            command.CommandTimeout = 600; // 10 minutes

            await command.ExecuteNonQueryAsync();

            // Verify backup
            if (File.Exists(backupPath))
            {
                var fileInfo = new FileInfo(backupPath);
                _logger.LogInformation("Full backup completed successfully. Size: {Size} MB", fileInfo.Length / 1024 / 1024);
                
                // Record backup in history
                await RecordBackupHistoryAsync(backupPath, "Full", fileInfo.Length);
                
                return (true, $"Full backup created successfully. Size: {fileInfo.Length / 1024 / 1024} MB", backupPath);
            }

            return (false, "Backup file was not created", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create full backup");
            return (false, $"Backup failed: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message, string? BackupPath)> CreateDifferentialBackupAsync()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"{_databaseName}_Diff_{timestamp}.bak";
            var backupPath = Path.Combine(_backupDirectory, backupFileName);

            _logger.LogInformation("Starting differential backup of {Database}", _databaseName);

            using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
            await connection.OpenAsync();

            var backupCommand = $@"
                BACKUP DATABASE [{_databaseName}] 
                TO DISK = '{backupPath}'
                WITH DIFFERENTIAL,
                     FORMAT,
                     MEDIANAME = 'FarmEaseBackup',
                     NAME = 'Differential Backup of {_databaseName}',
                     COMPRESSION,
                     STATS = 10";

            using var command = new Microsoft.Data.SqlClient.SqlCommand(backupCommand, connection);
            command.CommandTimeout = 300;

            await command.ExecuteNonQueryAsync();

            if (File.Exists(backupPath))
            {
                var fileInfo = new FileInfo(backupPath);
                _logger.LogInformation("Differential backup completed. Size: {Size} MB", fileInfo.Length / 1024 / 1024);
                
                await RecordBackupHistoryAsync(backupPath, "Differential", fileInfo.Length);
                
                return (true, $"Differential backup created. Size: {fileInfo.Length / 1024 / 1024} MB", backupPath);
            }

            return (false, "Backup file was not created", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create differential backup");
            return (false, $"Backup failed: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message, string? BackupPath)> CreateTransactionLogBackupAsync()
    {
        try
        {
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            var backupFileName = $"{_databaseName}_Log_{timestamp}.trn";
            var backupPath = Path.Combine(_backupDirectory, backupFileName);

            _logger.LogInformation("Starting transaction log backup of {Database}", _databaseName);

            using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
            await connection.OpenAsync();

            var backupCommand = $@"
                BACKUP LOG [{_databaseName}] 
                TO DISK = '{backupPath}'
                WITH FORMAT,
                     MEDIANAME = 'FarmEaseBackup',
                     NAME = 'Transaction Log Backup of {_databaseName}',
                     COMPRESSION,
                     STATS = 10";

            using var command = new Microsoft.Data.SqlClient.SqlCommand(backupCommand, connection);
            command.CommandTimeout = 120;

            await command.ExecuteNonQueryAsync();

            if (File.Exists(backupPath))
            {
                var fileInfo = new FileInfo(backupPath);
                _logger.LogInformation("Transaction log backup completed. Size: {Size} KB", fileInfo.Length / 1024);
                
                await RecordBackupHistoryAsync(backupPath, "TransactionLog", fileInfo.Length);
                
                return (true, $"Transaction log backup created. Size: {fileInfo.Length / 1024} KB", backupPath);
            }

            return (false, "Backup file was not created", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create transaction log backup");
            return (false, $"Backup failed: {ex.Message}", null);
        }
    }

    public async Task<IEnumerable<BackupInfo>> GetBackupHistoryAsync()
    {
        var backups = new List<BackupInfo>();

        try
        {
            var backupFiles = Directory.GetFiles(_backupDirectory, "*.*")
                .Where(f => f.EndsWith(".bak") || f.EndsWith(".trn"))
                .OrderByDescending(f => f);

            foreach (var file in backupFiles)
            {
                var fileInfo = new FileInfo(file);
                backups.Add(new BackupInfo
                {
                    FileName = fileInfo.Name,
                    FullPath = file,
                    SizeBytes = fileInfo.Length,
                    CreatedAt = fileInfo.CreationTimeUtc,
                    Type = DetermineBackupType(file)
                });
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to get backup history");
        }

        return await Task.FromResult(backups);
    }

    public async Task<(bool Success, string Message)> RestoreBackupAsync(string backupPath, bool withRecovery = true)
    {
        try
        {
            if (!File.Exists(backupPath))
                return (false, "Backup file not found");

            _logger.LogWarning("Starting database restore from {Path}. THIS WILL REPLACE ALL DATA!", backupPath);

            using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
            await connection.OpenAsync();

            // Set database to single user mode
            var setSingleUserCmd = $@"
                ALTER DATABASE [{_databaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE";
            
            using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(setSingleUserCmd, connection))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            // Restore database
            var restoreCommand = $@"
                RESTORE DATABASE [{_databaseName}] 
                FROM DISK = '{backupPath}'
                WITH REPLACE,
                     {(withRecovery ? "RECOVERY" : "NORECOVERY")},
                     STATS = 10";

            using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(restoreCommand, connection))
            {
                cmd.CommandTimeout = 600;
                await cmd.ExecuteNonQueryAsync();
            }

            // Set database back to multi user mode
            var setMultiUserCmd = $@"
                ALTER DATABASE [{_databaseName}] SET MULTI_USER";
            
            using (var cmd = new Microsoft.Data.SqlClient.SqlCommand(setMultiUserCmd, connection))
            {
                await cmd.ExecuteNonQueryAsync();
            }

            _logger.LogInformation("Database restored successfully from {Path}", backupPath);
            return (true, "Database restored successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to restore database");
            
            // Try to set multi-user mode on failure
            try
            {
                using var connection = new Microsoft.Data.SqlClient.SqlConnection(_connectionString);
                await connection.OpenAsync();
                var cmd = new Microsoft.Data.SqlClient.SqlCommand($"ALTER DATABASE [{_databaseName}] SET MULTI_USER", connection);
                await cmd.ExecuteNonQueryAsync();
            }
            catch { /* Ignore */ }
            
            return (false, $"Restore failed: {ex.Message}");
        }
    }

    public async Task CleanupOldBackupsAsync(int retentionDays = 30)
    {
        try
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-retentionDays);
            var files = Directory.GetFiles(_backupDirectory, "*.*")
                .Where(f => f.EndsWith(".bak") || f.EndsWith(".trn"));

            var deletedCount = 0;
            foreach (var file in files)
            {
                var fileInfo = new FileInfo(file);
                if (fileInfo.CreationTimeUtc < cutoffDate)
                {
                    File.Delete(file);
                    _logger.LogInformation("Deleted old backup: {File}", fileInfo.Name);
                    deletedCount++;
                }
            }

            _logger.LogInformation("Cleanup completed. Deleted {Count} old backups", deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to cleanup old backups");
        }

        await Task.CompletedTask;
    }

    private string DetermineBackupType(string fileName)
    {
        if (fileName.Contains("_Full_")) return "Full";
        if (fileName.Contains("_Diff_")) return "Differential";
        if (fileName.Contains("_Log_")) return "TransactionLog";
        return "Unknown";
    }

    private async Task RecordBackupHistoryAsync(string backupPath, string backupType, long sizeBytes)
    {
        // In production, this would write to a BackupHistory table
        // For now, we log it
        _logger.LogInformation(
            "Backup recorded - Type: {Type}, Path: {Path}, Size: {Size}, Timestamp: {Timestamp}",
            backupType, backupPath, sizeBytes, DateTime.UtcNow);
        
        await Task.CompletedTask;
    }
}

public class BackupInfo
{
    public string FileName { get; set; } = string.Empty;
    public string FullPath { get; set; } = string.Empty;
    public long SizeBytes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string Type { get; set; } = string.Empty;
}
