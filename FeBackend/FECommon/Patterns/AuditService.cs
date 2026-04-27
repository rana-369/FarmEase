using System.Text.Json;
using Microsoft.AspNetCore.Http;

namespace FECommon.Patterns
{
    /// <summary>
    /// Audit log entry for tracking entity changes
    /// </summary>
    public class AuditLog
    {
        public int Id { get; set; }
        public string EntityType { get; set; } = string.Empty;
        public int EntityId { get; set; }
        public string Action { get; set; } = string.Empty; // Created, Updated, Deleted
        public string? UserId { get; set; }
        public string? UserName { get; set; }
        public string? OldValues { get; set; } // JSON
        public string? NewValues { get; set; } // JSON
        public string? ChangedProperties { get; set; } // JSON array of changed property names
        public string IpAddress { get; set; } = string.Empty;
        public string UserAgent { get; set; } = string.Empty;
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    }

    /// <summary>
    /// Interface for audit logging service
    /// </summary>
    public interface IAuditService
    {
        Task LogAsync<T>(T entity, string action, string? userId = null, string? userName = null, 
            object? oldValues = null, object? newValues = null, string[]? changedProperties = null);
        Task<IEnumerable<AuditLog>> GetEntityHistoryAsync(string entityType, int entityId);
        Task<IEnumerable<AuditLog>> GetUserActivityAsync(string userId, int limit = 50);
    }

    /// <summary>
    /// Audit service implementation
    /// </summary>
    public class AuditService : IAuditService
    {
        private readonly List<AuditLog> _auditLogs = []; // In production, use database
        private readonly IHttpContextAccessor? _httpContextAccessor;

        public AuditService(IHttpContextAccessor? httpContextAccessor = null)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public Task LogAsync<T>(T entity, string action, string? userId = null, string? userName = null,
            object? oldValues = null, object? newValues = null, string[]? changedProperties = null)
        {
            var httpContext = _httpContextAccessor?.HttpContext;
            var entityName = typeof(T).Name;
            var entityId = GetEntityId(entity);

            var auditLog = new AuditLog
            {
                EntityType = entityName,
                EntityId = entityId,
                Action = action,
                UserId = userId ?? httpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value,
                UserName = userName ?? httpContext?.User?.FindFirst(System.Security.Claims.ClaimTypes.Name)?.Value,
                OldValues = oldValues != null ? JsonSerializer.Serialize(oldValues) : null,
                NewValues = newValues != null ? JsonSerializer.Serialize(newValues) : null,
                ChangedProperties = changedProperties != null ? JsonSerializer.Serialize(changedProperties) : null,
                IpAddress = httpContext?.Connection?.RemoteIpAddress?.ToString() ?? "Unknown",
                UserAgent = httpContext?.Request?.Headers.TryGetValue("User-Agent", out var ua) == true ? ua.ToString() : "Unknown",
                Timestamp = DateTime.UtcNow
            };

            _auditLogs.Add(auditLog);
            
            // In production, save to database
            Console.WriteLine($"[AUDIT] {auditLog.Action} {auditLog.EntityType}(Id={auditLog.EntityId}) by {auditLog.UserName ?? "Anonymous"}");
            
            return Task.CompletedTask;
        }

        public Task<IEnumerable<AuditLog>> GetEntityHistoryAsync(string entityType, int entityId)
        {
            var logs = _auditLogs
                .Where(l => l.EntityType.Equals(entityType, StringComparison.OrdinalIgnoreCase) && l.EntityId == entityId)
                .OrderByDescending(l => l.Timestamp)
                .ToList();
            return Task.FromResult<IEnumerable<AuditLog>>(logs);
        }

        public Task<IEnumerable<AuditLog>> GetUserActivityAsync(string userId, int limit = 50)
        {
            var logs = _auditLogs
                .Where(l => l.UserId == userId)
                .OrderByDescending(l => l.Timestamp)
                .Take(limit)
                .ToList();
            return Task.FromResult<IEnumerable<AuditLog>>(logs);
        }

        private int GetEntityId<T>(T entity)
        {
            if (entity == null) return 0;

            var idProperty = typeof(T).GetProperty("Id");
            if (idProperty != null)
            {
                var idValue = idProperty.GetValue(entity);
                if (idValue is int intId)
                    return intId;
            }

            return 0;
        }
    }
}
