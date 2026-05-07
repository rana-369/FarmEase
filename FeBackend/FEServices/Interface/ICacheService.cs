namespace FEServices.Interface;

/// <summary>
/// Distributed cache service interface for Redis caching
/// </summary>
public interface ICacheService
{
    /// <summary>
    /// Get cached value by key
    /// </summary>
    Task<T?> GetAsync<T>(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Set cached value with optional expiration
    /// </summary>
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove cached value
    /// </summary>
    Task RemoveAsync(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Check if key exists
    /// </summary>
    Task<bool> ExistsAsync(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get or create cached value (cache-aside pattern)
    /// </summary>
    Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Remove all keys matching pattern
    /// </summary>
    Task RemoveByPatternAsync(string pattern, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Increment counter
    /// </summary>
    Task<long> IncrementAsync(string key, long value = 1, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Set hash field
    /// </summary>
    Task HashSetAsync<T>(string key, string field, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get hash field
    /// </summary>
    Task<T?> HashGetAsync<T>(string key, string field, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get all hash fields
    /// </summary>
    Task<Dictionary<string, T>?> HashGetAllAsync<T>(string key, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Add to set
    /// </summary>
    Task SetAddAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken cancellationToken = default);
    
    /// <summary>
    /// Get all set members
    /// </summary>
    Task<IEnumerable<T>> SetMembersAsync<T>(string key, CancellationToken cancellationToken = default);
}
