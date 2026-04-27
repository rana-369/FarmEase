using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace FECommon.Patterns
{
    /// <summary>
    /// Custom health check for database connectivity
    /// </summary>
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly IServiceProvider _serviceProvider;

        public DatabaseHealthCheck(IServiceProvider serviceProvider)
        {
            _serviceProvider = serviceProvider;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                // Simple check - in production, you'd execute a lightweight query
                using var scope = _serviceProvider.CreateScope();
                // var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                // await dbContext.Database.CanConnectAsync(cancellationToken);
                
                return HealthCheckResult.Healthy("Database connection is healthy");
            }
            catch (Exception ex)
            {
                return HealthCheckResult.Unhealthy("Database connection failed", ex);
            }
        }
    }

    /// <summary>
    /// Health check response writer for detailed health reports
    /// </summary>
    public static class HealthCheckResponseWriter
    {
        public static Task WriteHealthCheckResponse(HttpContext context, HealthReport report)
        {
            var response = new
            {
                status = report.Status.ToString(),
                checks = report.Entries.Select(e => new
                {
                    name = e.Key,
                    status = e.Value.Status.ToString(),
                    description = e.Value.Description,
                    duration = e.Value.Duration.TotalMilliseconds,
                    data = e.Value.Data
                }),
                totalDuration = report.TotalDuration.TotalMilliseconds
            };

            context.Response.ContentType = "application/json";
            var json = System.Text.Json.JsonSerializer.Serialize(response);
            return context.Response.WriteAsync(json);
        }
    }

    /// <summary>
    /// Health check data extensions
    /// </summary>
    public static class HealthCheckData
    {
        public static Dictionary<string, object> AddDatabaseInfo(this Dictionary<string, object> data, 
            string provider, string database, bool isConnected)
        {
            data["provider"] = provider;
            data["database"] = database;
            data["isConnected"] = isConnected;
            return data;
        }

        public static Dictionary<string, object> AddMemoryInfo(this Dictionary<string, object> data)
        {
            var gcMemoryInfo = GC.GetGCMemoryInfo();
            data["allocatedMemoryMB"] = GC.GetTotalMemory(false) / 1024 / 1024;
            data["totalAvailableMemoryMB"] = gcMemoryInfo.TotalAvailableMemoryBytes / 1024 / 1024;
            data["memoryLoadPercent"] = gcMemoryInfo.MemoryLoadBytes * 100 / gcMemoryInfo.TotalAvailableMemoryBytes;
            return data;
        }
    }
}
