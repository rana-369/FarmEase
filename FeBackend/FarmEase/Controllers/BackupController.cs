using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using FEServices.Interface;
using FEServices.Service;

namespace FarmEase.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[Authorize(Policy = "RequireAdminRole")]
[EnableRateLimiting("ApiPolicy")]
public class BackupController : ControllerBase
{
    private readonly IDatabaseBackupService _backupService;
    private readonly ILogger<BackupController> _logger;

    public BackupController(IDatabaseBackupService backupService, ILogger<BackupController> logger)
    {
        _backupService = backupService;
        _logger = logger;
    }

    /// <summary>
    /// Create a full database backup
    /// </summary>
    [HttpPost("full")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> CreateFullBackup()
    {
        _logger.LogInformation("Manual full backup triggered by admin");
        
        var result = await _backupService.CreateFullBackupAsync();
        
        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                backupPath = result.BackupPath,
                timestamp = DateTime.UtcNow
            });
        }
        
        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Create a differential database backup
    /// </summary>
    [HttpPost("differential")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> CreateDifferentialBackup()
    {
        _logger.LogInformation("Manual differential backup triggered by admin");
        
        var result = await _backupService.CreateDifferentialBackupAsync();
        
        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                backupPath = result.BackupPath,
                timestamp = DateTime.UtcNow
            });
        }
        
        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Create a transaction log backup
    /// </summary>
    [HttpPost("transaction-log")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> CreateTransactionLogBackup()
    {
        _logger.LogInformation("Manual transaction log backup triggered by admin");
        
        var result = await _backupService.CreateTransactionLogBackupAsync();
        
        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                backupPath = result.BackupPath,
                timestamp = DateTime.UtcNow
            });
        }
        
        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Get backup history
    /// </summary>
    [HttpGet("history")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> GetBackupHistory()
    {
        var backups = await _backupService.GetBackupHistoryAsync();
        
        return Ok(new
        {
            success = true,
            count = backups.Count(),
            backups = backups.Select(b => new
            {
                b.FileName,
                b.Type,
                SizeMB = Math.Round(b.SizeBytes / 1024.0 / 1024.0, 2),
                b.CreatedAt,
                b.FullPath
            })
        });
    }

    /// <summary>
    /// Restore database from a backup file
    /// </summary>
    [HttpPost("restore")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> RestoreBackup([FromBody] RestoreBackupRequest request)
    {
        _logger.LogWarning("Database restore requested for: {BackupPath}", request.BackupPath);
        
        var result = await _backupService.RestoreBackupAsync(
            request.BackupPath, 
            request.WithRecovery);
        
        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                timestamp = DateTime.UtcNow
            });
        }
        
        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Cleanup old backups
    /// </summary>
    [HttpPost("cleanup")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    public async Task<IActionResult> CleanupOldBackups([FromQuery] int retentionDays = 30)
    {
        _logger.LogInformation("Manual backup cleanup triggered. Retention: {Days} days", retentionDays);
        
        await _backupService.CleanupOldBackupsAsync(retentionDays);
        
        return Ok(new
        {
            success = true,
            message = $"Cleanup completed. Backups older than {retentionDays} days have been removed.",
            timestamp = DateTime.UtcNow
        });
    }
}

public class RestoreBackupRequest
{
    public string BackupPath { get; set; } = string.Empty;
    public bool WithRecovery { get; set; } = true;
}
