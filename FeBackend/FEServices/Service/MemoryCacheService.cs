using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Collections.Concurrent;
using System.Text.Json;
using FEServices.Interface;

namespace FEServices.Service;

/// <summary>
/// In-memory cache service fallback when Redis is not available
/// </summary>
public class MemoryCacheService : ICacheService
{
    private readonly IMemoryCache _memoryCache;
    private readonly ILogger<MemoryCacheService> _logger;
    private readonly TimeSpan _defaultExpiration;
    private readonly ConcurrentDictionary<string, SemaphoreSlim> _locks = new();
    
    // Simulate hash and set storage for in-memory
    private readonly ConcurrentDictionary<string, ConcurrentDictionary<string, string>> _hashStore = new();
    private readonly ConcurrentDictionary<string, ConcurrentHashSet<string>> _setStore = new();

    public MemoryCacheService(IMemoryCache memoryCache, IConfiguration configuration, ILogger<MemoryCacheService> logger)
    {
        _memoryCache = memoryCache;
        _logger = logger;
        _defaultExpiration = TimeSpan.FromMinutes(configuration.GetValue("Redis:DefaultExpirationMinutes", 30));
        
        _logger.LogInformation("In-memory cache service initialized (Redis fallback)");
    }

    public Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_memoryCache.TryGetValue(key, out var value))
            {
                _logger.LogDebug("Memory cache hit for key: {Key}", key);
                return Task.FromResult((T?)value);
            }
            
            _logger.LogDebug("Memory cache miss for key: {Key}", key);
            return Task.FromResult<T?>(default);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting from memory cache: {Key}", key);
            return Task.FromResult<T?>(default);
        }
    }

    public Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var expiry = expiration ?? _defaultExpiration;
            
            _memoryCache.Set(key, value, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiry,
                SlidingExpiration = TimeSpan.FromMinutes(10)
            });
            
            _logger.LogDebug("Memory cache set for key: {Key}, expiration: {Expiration}", key, expiry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting memory cache: {Key}", key);
        }
        
        return Task.CompletedTask;
    }

    public Task RemoveAsync(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            _memoryCache.Remove(key);
            _hashStore.TryRemove(key, out _);
            _setStore.TryRemove(key, out _);
            
            _logger.LogDebug("Memory cache removed for key: {Key}", key);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing memory cache: {Key}", key);
        }
        
        return Task.CompletedTask;
    }

    public Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default)
    {
        return Task.FromResult(_memoryCache.TryGetValue(key, out _));
    }

    public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        if (_memoryCache.TryGetValue(key, out var cachedValue) && cachedValue is T typedValue)
        {
            return typedValue;
        }
        
        // Use SemaphoreSlim to prevent cache stampede
        var lockObj = _locks.GetOrAdd(key, _ => new SemaphoreSlim(1, 1));
        await lockObj.WaitAsync(cancellationToken);
        
        try
        {
            // Double-check after acquiring lock
            if (_memoryCache.TryGetValue(key, out cachedValue) && cachedValue is T doubleCheckedValue)
            {
                return doubleCheckedValue;
            }
            
            var value = await factory();
            await SetAsync(key, value, expiration, cancellationToken);
            
            return value;
        }
        finally
        {
            lockObj.Release();
            _locks.TryRemove(key, out _);
        }
    }

    public Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default)
    {
        // In-memory cache doesn't support pattern matching efficiently
        // This would require tracking all keys
        _logger.LogWarning("RemoveByPatternAsync not fully supported in memory cache: {Pattern}", pattern);
        return Task.CompletedTask;
    }

    public Task<long> IncrementAsync(string key, long value = 1, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var currentValue = _memoryCache.TryGetValue(key, out var v) && v is long longValue ? longValue : 0L;
            var newValue = currentValue + value;
            
            _memoryCache.Set(key, newValue, new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = expiration ?? _defaultExpiration
            });
            
            return Task.FromResult(newValue);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error incrementing memory cache: {Key}", key);
            return Task.FromResult(0L);
        }
    }

    public Task HashSetAsync<T>(string key, string field, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var hash = _hashStore.GetOrAdd(key, _ => new ConcurrentDictionary<string, string>());
            hash[field] = JsonSerializer.Serialize(value);
            
            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error setting hash in memory cache: {Key}", key);
            return Task.CompletedTask;
        }
    }

    public Task<T?> HashGetAsync<T>(string key, string field, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_hashStore.TryGetValue(key, out var hash) && hash.TryGetValue(field, out var value))
            {
                return Task.FromResult(JsonSerializer.Deserialize<T>(value));
            }
            
            return Task.FromResult<T?>(default);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting hash from memory cache: {Key}", key);
            return Task.FromResult<T?>(default);
        }
    }

    public Task<Dictionary<string, T>?> HashGetAllAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_hashStore.TryGetValue(key, out var hash))
            {
                return Task.FromResult<Dictionary<string, T>?>(
                    hash.ToDictionary(
                        x => x.Key,
                        x => JsonSerializer.Deserialize<T>(x.Value)!));
            }
            
            return Task.FromResult<Dictionary<string, T>?>(null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all hash fields from memory cache: {Key}", key);
            return Task.FromResult<Dictionary<string, T>?>(null);
        }
    }

    public Task SetAddAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var set = _setStore.GetOrAdd(key, _ => new ConcurrentHashSet<string>());
            set.Add(JsonSerializer.Serialize(value));
            
            return Task.CompletedTask;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding to set in memory cache: {Key}", key);
            return Task.CompletedTask;
        }
    }

    public Task<IEnumerable<T>> SetMembersAsync<T>(string key, CancellationToken cancellationToken = default)
    {
        try
        {
            if (_setStore.TryGetValue(key, out var set))
            {
                return Task.FromResult(set.Keys.Select(s => JsonSerializer.Deserialize<T>(s)!));
            }
            
            return Task.FromResult(Enumerable.Empty<T>());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting set members from memory cache: {Key}", key);
            return Task.FromResult(Enumerable.Empty<T>());
        }
    }
}

/// <summary>
/// Thread-safe hash set for in-memory set storage
/// </summary>
internal class ConcurrentHashSet<T> : ConcurrentDictionary<T, byte> where T : notnull
{
    public bool Add(T item) => TryAdd(item, 0);
    public bool Contains(T item) => ContainsKey(item);
    public bool Remove(T item) => TryRemove(item, out _);
}
