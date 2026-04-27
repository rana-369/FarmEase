namespace FarmEase.Middleware
{
    /// <summary>
    /// Middleware to add security headers to all responses
    /// </summary>
    public class SecurityHeadersMiddleware
    {
        private readonly RequestDelegate _next;

        public SecurityHeadersMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Prevent clickjacking
            context.Response.Headers["X-Frame-Options"] = "DENY";
            
            // Prevent MIME type sniffing
            context.Response.Headers["X-Content-Type-Options"] = "nosniff";
            
            // Enable XSS protection
            context.Response.Headers["X-XSS-Protection"] = "1; mode=block";
            
            // Control referrer information
            context.Response.Headers["Referrer-Policy"] = "strict-origin-when-cross-origin";
            
            // Content Security Policy for API
            context.Response.Headers["Content-Security-Policy"] = "default-src 'self'";
            
            // Permissions Policy (formerly Feature Policy)
            context.Response.Headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
            
            // Remove server identification
            context.Response.Headers.Remove("Server");
            context.Response.Headers.Remove("X-Powered-By");

            await _next(context);
        }
    }

    /// <summary>
    /// Extension methods for security headers middleware registration
    /// </summary>
    public static class SecurityHeadersMiddlewareExtensions
    {
        public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SecurityHeadersMiddleware>();
        }
    }
}
