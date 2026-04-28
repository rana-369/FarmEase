using System.Net;
using System.Text.Json;
using FECommon.Exceptions;

namespace FarmEase.Middleware
{
    /// <summary>
    /// Global exception handling middleware for consistent error responses
    /// </summary>
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IHostEnvironment _environment;

        public ExceptionHandlingMiddleware(
            RequestDelegate next, 
            ILogger<ExceptionHandlingMiddleware> logger,
            IHostEnvironment environment)
        {
            _next = next;
            _logger = logger;
            _environment = environment;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var response = context.Response;
            response.ContentType = "application/json";

            var errorResponse = new ErrorResponse();

            switch (exception)
            {
                case AppException appEx:
                    // Application-specific exceptions
                    response.StatusCode = appEx.StatusCode;
                    errorResponse.StatusCode = appEx.StatusCode;
                    errorResponse.ErrorCode = appEx.ErrorCode;
                    errorResponse.Message = appEx.Message;
                    
                    if (appEx is ValidationException valEx && valEx.ValidationErrors is { Count: > 0 })
                    {
                        errorResponse.Details = valEx.ValidationErrors
                            .SelectMany(kvp => kvp.Value.Select(v => $"{kvp.Key}: {v}"))
                            .ToList();
                    }

                    _logger.LogWarning(appEx, "Application exception occurred: {ErrorCode} - {Message}", 
                        appEx.ErrorCode, appEx.Message);
                    break;

                case UnauthorizedAccessException:
                    response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    errorResponse.StatusCode = 401;
                    errorResponse.ErrorCode = "UNAUTHORIZED";
                    errorResponse.Message = "Unauthorized access";
                    
                    _logger.LogWarning("Unauthorized access attempt");
                    break;

                default:
                    // Unexpected exceptions
                    response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    errorResponse.StatusCode = 500;
                    errorResponse.ErrorCode = "INTERNAL_ERROR";
                    errorResponse.Message = _environment.IsDevelopment() 
                        ? exception.Message 
                        : "An unexpected error occurred. Please try again later.";

                    // Include stack trace only in development
                    if (_environment.IsDevelopment())
                    {
                        errorResponse.Details =
                        [
                            exception.StackTrace ?? "No stack trace available"
                        ];
                    }

                    _logger.LogError(exception, "Unhandled exception occurred");
                    break;
            }

            // Add trace ID for debugging
            errorResponse.TraceId = context.TraceIdentifier;
            errorResponse.Timestamp = DateTime.UtcNow;

            var options = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };

            await response.WriteAsync(JsonSerializer.Serialize(errorResponse, options));
        }
    }

    /// <summary>
    /// Standardized error response model
    /// </summary>
    public class ErrorResponse
    {
        public bool Success => false;
        public int StatusCode { get; set; }
        public string ErrorCode { get; set; } = "INTERNAL_ERROR";
        public string Message { get; set; } = "An error occurred";
        public List<string>? Details { get; set; }
        public string? TraceId { get; set; }
        public DateTime Timestamp { get; set; }
    }

    /// <summary>
    /// Extension methods for middleware registration
    /// </summary>
    public static class ExceptionHandlingMiddlewareExtensions
    {
        public static IApplicationBuilder UseExceptionHandling(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
