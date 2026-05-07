using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using FEServices.Interface;

namespace FEServices.Service;

/// <summary>
/// Redis-based distributed cache service implementation
/// </summary>
public class RedisCacheService : ICacheService, IDisposable
{
    private readonly ILogger<RedisCacheService> _logger;
    private readonly ConnectionMultiplexer _redis;
    private readonly IDatabase _database;
    private readonly TimeSpan _defaultExpiration;
    private readonly string _instanceName;

    public RedisCacheService(IConfiguration configuration, ILogger<RedisCacheService> logger)
    {
        _logger = logger;
        
        var connectionString = configuration.GetConnectionString("Redis") 
            ?? configuration["Redis:ConnectionString"] 
            ?? "localhost:6379";
        
        _instanceName = configuration["Redis:InstanceName"] ?? "FarmEase:";
        _defaultExpiration = TimeSpan.FromMinutes(configuration.GetValue("Redis:DefaultExpirationMinutes", 30));
        
        try
        {
            var options = ConfigurationOptions.Parse(connectionString);
            options.AbortOnConnectFail = false;
            options.ConnectRetry = 3;
            options.ConnectTimeout = 5000;
            options.SyncTimeout = 5000;
            options.AsyncTimeout = 5000;
            options.KeepAlive = 60;
            
            _redis = ConnectionMultiplexer.Connect(options);
            _database = _redis.GetDatabase();
            
            _redis.ConnectionFailed += OnConnectionFailed;
            _redis.ConnectionRestored += OnConnectionRestored;
            
            _logger.LogInformation("Redis cache connected successfully. Instance: {Instance}", _instanceName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to connect to Redis. Application will continue without caching.");
            throw;
        }
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var value = await _database.StringGetAsync(fullKey);
            
            if (value.IsNullOrEmpty)
            {
                _logger.LogDebug("Cache miss for key: {Key}", fullKey);
                return default;
            }
            
            _logger.LogDebug("Cache hit for key: {Key}", fullKey);
            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting cache key: {Key}", key);
            return default;
        }
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var serializedValue = JsonSerializer.Serialize(value);
            var expiry = expiration ?? _defaultExpiration;
            
            await _database.StringSetAsync(fullKey, serializedValue, expiry);
            
            _logger.LogDebug("Cache set for key: {Key}, expiration: {Expiration}", fullKey, expiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting cache key: {Key}", key);
        }
    }

    public async Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            await _database.KeyDeleteAsync(fullKey);
            
            _logger.LogDebug("Cache removed for key: {Key}", fullKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache key: {Key}", key);
        }
    }

    public async Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            return await _database.KeyExistsAsync(fullKey);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking cache key existence: {Key}", key);
            return false;
        }
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        var cachedValue = await GetAsync<T>(key, cancellationToken);
        
        if (cachedValue != null)
        {
            return cachedValue;
        }
        
        var value = await factory();
        await SetAsync(key, value, expiration, cancellationToken);
        
        return value;
    }

    public async Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullPattern = GetFullKey(pattern);
            var endpoints = _redis.GetEndPoints();
            var server = _redis.GetServer(endpoints[0]);
            
            var keys = server.Keys(pattern: fullPattern).ToArray();
            
            if (keys.Length > 0)
            {
                await _database.KeyDeleteAsync(keys);
                _logger.LogInformation("Removed {Count} cache keys matching pattern: {Pattern}", keys.Length, fullPattern);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing cache keys by pattern: {Pattern}", pattern);
        }
    }

    public async Task<long> IncrementAsync(string key, long value = 1, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var result = await _database.StringIncrementAsync(fullKey, value);
            
            if (expiration.HasValue)
            {
                await _database.KeyExpireAsync(fullKey, expiration.Value);
            }
            
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing cache key: {Key}", key);
            return 0;
        }
    }

    public async Task HashSetAsync<T>(string key, string field, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var serializedValue = JsonSerializer.Serialize(value);
            
            await _database.HashSetAsync(fullKey, field, serializedValue);
            
            if (expiration.HasValue)
            {
                await _database.KeyExpireAsync(fullKey, expiration.Value);
            }
            
            _logger.LogDebug("Hash set for key: {Key}, field: {Field}", fullKey, field);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting hash field: {Key}, {Field}", key, field);
        }
    }

    public async Task<T?> HashGetAsync<T>(string key, string field, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var value = await _database.HashGetAsync(fullKey, field);
            
            if (value.IsNullOrEmpty)
            {
                return default;
            }
            
            return JsonSerializer.Deserialize<T>(value!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hash field: {Key}, {Field}", key, field);
            return default;
        }
    }

    public async Task<Dictionary<string, T>?> HashGetAllAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var entries = await _database.HashGetAllAsync(fullKey);
            
            if (entries.Length == 0)
            {
                return null;
            }
            
            return entries.ToDictionary(
                x => x.Name.ToString(),
                x => JsonSerializer.Deserialize<T>(x.Value!)!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all hash fields: {Key}", key);
            return null;
        }
    }

    public async Task SetAddAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var serializedValue = JsonSerializer.Serialize(value);
            
            await _database.SetAddAsync(fullKey, serializedValue);
            
            if (expiration.HasValue)
            {
                await _database.KeyExpireAsync(fullKey, expiration.Value);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to set: {Key}", key);
        }
    }

    public async Task<IEnumerable<T>> SetMembersAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            var fullKey = GetFullKey(key);
            var members = await _database.SetMembersAsync(fullKey);
            
            return members.Select(m => JsonSerializer.Deserialize<T>(m!)!);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting set members: {Key}", key);
            return Enumerable.Empty<T>();
        }
    }

    private string GetFullKey(string key) => $"{_instanceName}{key}";

    private void OnConnectionFailed(object? sender, ConnectionFailedEventArgs e)
    {
        _logger.LogWarning("Redis connection failed: {FailureType}. Endpoint: {Endpoint}", 
            e.FailureType, e.EndPoint);
    }

    private void OnConnectionRestored(object? sender, ConnectionFailedEventArgs e)
    {
        _logger.LogInformation("Redis connection restored. Endpoint: {Endpoint}", e.EndPoint);
    }

    public void Dispose()
    {
        GC.SuppressFinalize(this);
        _redis?.Dispose();
    }
}
