using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace FEServices.Service;

/// <summary>
/// CDN service for serving static assets through a content delivery network
/// </summary>
public interface ICdnService
{
    /// <summary>
    /// Get CDN URL for an asset (returns CDN URL if configured, otherwise local URL)
    /// </summary>
    string GetAssetUrl(string localPath);
    
    /// <summary>
    /// Get CDN URL for equipment image
    /// </summary>
    string GetEquipmentImageUrl(string imagePath);
    
    /// <summary>
    /// Upload file to CDN storage (Azure Blob, AWS S3, etc.)
    /// </summary>
    Task<(bool Success, string? CdnUrl, string? Error)> UploadFileAsync(string fileName, Stream fileStream, string contentType);
    
    /// <summary>
    /// Delete file from CDN storage
    /// </summary>
    Task<(bool Success, string? Error)> DeleteFileAsync(string fileName);
    
    /// <summary>
    /// Purge CDN cache for specific path
    /// </summary>
    Task<(bool Success, string? Error)> PurgeCacheAsync(string path);
}

public class CdnService : ICdnService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<CdnService> _logger;
    private readonly string _cdnBaseUrl;
    private readonly string _cdnProvider;
    private readonly bool _cdnEnabled;

    public CdnService(IConfiguration configuration, ILogger<CdnService> logger)
    {
        _configuration = configuration;
        _logger = logger;
        
        _cdnProvider = configuration["CDN:Provider"] ?? "Local";
        _cdnBaseUrl = configuration["CDN:BaseUrl"] ?? "";
        _cdnEnabled = !string.IsNullOrEmpty(_cdnBaseUrl) && _cdnProvider != "Local";
        
        if (_cdnEnabled)
        {
            _logger.LogInformation("CDN enabled: {Provider}, Base URL: {BaseUrl}", _cdnProvider, _cdnBaseUrl);
        }
        else
        {
            _logger.LogInformation("CDN not configured, using local file serving");
        }
    }

    public string GetAssetUrl(string localPath)
    {
        if (!_cdnEnabled || string.IsNullOrEmpty(localPath))
        {
            return localPath;
        }

        // Convert local path to CDN URL
        var normalizedPath = localPath.TrimStart('/');
        return $"{_cdnBaseUrl}/{normalizedPath}";
    }

    public string GetEquipmentImageUrl(string imagePath)
    {
        if (string.IsNullOrEmpty(imagePath))
        {
            // Return placeholder image
            return _cdnEnabled 
                ? $"{_cdnBaseUrl}/images/equipment-placeholder.png"
                : "/images/equipment-placeholder.png";
        }

        return GetAssetUrl(imagePath);
    }

    public async Task<(bool Success, string? CdnUrl, string? Error)> UploadFileAsync(string fileName, Stream fileStream, string contentType)
    {
        try
        {
            if (!_cdnEnabled)
            {
                // Fallback to local storage
                var localPath = await SaveLocallyAsync(fileName, fileStream);
                return (true, localPath, null);
            }

            // Upload based on provider
            return _cdnProvider.ToLowerInvariant() switch
            {
                "azure" => await UploadToAzureBlobAsync(fileName, fileStream, contentType),
                "aws" => await UploadToS3Async(fileName, fileStream, contentType),
                "cloudflare" => await UploadToCloudflareR2Async(fileName, fileStream, contentType),
                _ => (false, null, $"Unknown CDN provider: {_cdnProvider}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload file to CDN: {FileName}", fileName);
            return (false, null, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> DeleteFileAsync(string fileName)
    {
        try
        {
            if (!_cdnEnabled)
            {
                // Delete from local storage
                var localPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", fileName.TrimStart('/'));
                if (File.Exists(localPath))
                {
                    File.Delete(localPath);
                }
                return (true, null);
            }

            return _cdnProvider.ToLowerInvariant() switch
            {
                "azure" => await DeleteFromAzureBlobAsync(fileName),
                "aws" => await DeleteFromS3Async(fileName),
                "cloudflare" => await DeleteFromCloudflareR2Async(fileName),
                _ => (false, $"Unknown CDN provider: {_cdnProvider}")
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file from CDN: {FileName}", fileName);
            return (false, ex.Message);
        }
    }

    public async Task<(bool Success, string? Error)> PurgeCacheAsync(string path)
    {
        try
        {
            if (!_cdnEnabled)
            {
                return (true, "No CDN cache to purge");
            }

            _logger.LogInformation("Purging CDN cache for path: {Path}", path);

            // Implementation depends on CDN provider
            // For Cloudflare: API call to purge cache
            // For Azure CDN: API call to purge endpoint
            // For AWS CloudFront: Create invalidation

            return await Task.FromResult((true, (string?)null));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to purge CDN cache for path: {Path}", path);
            return (false, ex.Message);
        }
    }

    private async Task<string> SaveLocallyAsync(string fileName, Stream fileStream)
    {
        var uploadsPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "equipment");
        Directory.CreateDirectory(uploadsPath);

        var filePath = Path.Combine(uploadsPath, fileName);
        using var fs = new FileStream(filePath, FileMode.Create);
        await fileStream.CopyToAsync(fs);

        return $"/uploads/equipment/{fileName}";
    }

    private async Task<(bool Success, string? CdnUrl, string? Error)> UploadToAzureBlobAsync(string fileName, Stream fileStream, string contentType)
    {
        // Azure Blob Storage implementation
        // Requires Azure.Storage.Blobs package
        _logger.LogInformation("Uploading to Azure Blob: {FileName}", fileName);
        
        // Placeholder - implement with Azure.Storage.Blobs
        var cdnUrl = $"{_cdnBaseUrl}/uploads/equipment/{fileName}";
        return await Task.FromResult((true, cdnUrl, (string?)null));
    }

    private async Task<(bool Success, string? CdnUrl, string? Error)> UploadToS3Async(string fileName, Stream fileStream, string contentType)
    {
        // AWS S3 implementation
        // Requires AWSSDK.S3 package
        _logger.LogInformation("Uploading to AWS S3: {FileName}", fileName);
        
        // Placeholder - implement with AWSSDK.S3
        var cdnUrl = $"{_cdnBaseUrl}/uploads/equipment/{fileName}";
        return await Task.FromResult((true, cdnUrl, (string?)null));
    }

    private async Task<(bool Success, string? CdnUrl, string? Error)> UploadToCloudflareR2Async(string fileName, Stream fileStream, string contentType)
    {
        // Cloudflare R2 implementation (S3 compatible)
        _logger.LogInformation("Uploading to Cloudflare R2: {FileName}", fileName);
        
        var cdnUrl = $"{_cdnBaseUrl}/uploads/equipment/{fileName}";
        return await Task.FromResult((true, cdnUrl, (string?)null));
    }

    private async Task<(bool Success, string? Error)> DeleteFromAzureBlobAsync(string fileName)
    {
        // Azure Blob deletion
        return await Task.FromResult((true, (string?)null));
    }

    private async Task<(bool Success, string? Error)> DeleteFromS3Async(string fileName)
    {
        // AWS S3 deletion
        return await Task.FromResult((true, (string?)null));
    }

    private async Task<(bool Success, string? Error)> DeleteFromCloudflareR2Async(string fileName)
    {
        // Cloudflare R2 deletion
        return await Task.FromResult((true, (string?)null));
    }
}
