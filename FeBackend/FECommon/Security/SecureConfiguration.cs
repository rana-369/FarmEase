using Microsoft.Extensions.Configuration;

namespace FECommon.Security
{
    /// <summary>
    /// Secure configuration helper that prioritizes environment variables over appsettings
    /// </summary>
    public static class SecureConfiguration
    {
        /// <summary>
        /// Gets a configuration value, checking environment variables first (for secrets),
        /// then falling back to IConfiguration. This allows production deployments to use
        /// environment variables while development can use appsettings.json
        /// </summary>
        public static string GetSecureValue(IConfiguration configuration, string configKey, string? envVarName = null)
        {
            // First, check environment variable (for production secrets)
            var envVar = envVarName ?? ConvertToEnvVarName(configKey);
            var envValue = Environment.GetEnvironmentVariable(envVar);
            
            if (!string.IsNullOrEmpty(envValue))
            {
                return envValue;
            }

            // Fallback to configuration (for development)
            return configuration[configKey] ?? string.Empty;
        }

        /// <summary>
        /// Gets a connection string, checking environment variables first
        /// </summary>
        public static string GetSecureConnectionString(IConfiguration configuration, string name = "DefaultConnection")
        {
            // Check for environment variable override
            var envVar = $"ConnectionStrings__{name}";
            var envValue = Environment.GetEnvironmentVariable(envVar);
            
            if (!string.IsNullOrEmpty(envValue))
            {
                return envValue;
            }

            // Fallback to configuration
            return configuration.GetConnectionString(name) ?? string.Empty;
        }

        /// <summary>
        /// Gets JWT settings securely
        /// </summary>
        public static JwtSettings GetJwtSettings(IConfiguration configuration)
        {
            return new JwtSettings
            {
                Secret = GetSecureValue(configuration, "JWT:Secret", "JWT_SECRET"),
                ValidIssuer = GetSecureValue(configuration, "JWT:ValidIssuer", "JWT_ISSUER"),
                ValidAudience = GetSecureValue(configuration, "JWT:ValidAudience", "JWT_AUDIENCE")
            };
        }

        /// <summary>
        /// Gets Razorpay settings securely
        /// </summary>
        public static RazorpaySettings GetRazorpaySettings(IConfiguration configuration)
        {
            return new RazorpaySettings
            {
                Key = GetSecureValue(configuration, "Razorpay:Key", "RAZORPAY_KEY"),
                Secret = GetSecureValue(configuration, "Razorpay:Secret", "RAZORPAY_SECRET"),
                WebhookSecret = GetSecureValue(configuration, "Razorpay:WebhookSecret", "RAZORPAY_WEBHOOK_SECRET")
            };
        }

        /// <summary>
        /// Gets SMTP settings securely
        /// </summary>
        public static SmtpSettings GetSmtpSettings(IConfiguration configuration)
        {
            return new SmtpSettings
            {
                Host = GetSecureValue(configuration, "SmtpSettings:Host", "SMTP_HOST"),
                Port = int.TryParse(GetSecureValue(configuration, "SmtpSettings:Port", "SMTP_PORT"), out var port) ? port : 587,
                Email = GetSecureValue(configuration, "SmtpSettings:Email", "SMTP_EMAIL"),
                Password = GetSecureValue(configuration, "SmtpSettings:Password", "SMTP_PASSWORD"),
                EnableSsl = bool.TryParse(GetSecureValue(configuration, "SmtpSettings:EnableSsl", "SMTP_ENABLE_SSL"), out var ssl) && ssl
            };
        }

        /// <summary>
        /// Checks if the application is running in production environment
        /// </summary>
        public static bool IsProduction(IConfiguration configuration)
        {
            var env = configuration["ASPNETCORE_ENVIRONMENT"] 
                      ?? Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") 
                      ?? "Development";
            
            return env.Equals("Production", StringComparison.OrdinalIgnoreCase);
        }

        /// <summary>
        /// Converts configuration key to environment variable format
        /// e.g., "JWT:Secret" -> "JWT_SECRET"
        /// </summary>
        private static string ConvertToEnvVarName(string configKey)
        {
            return configKey.Replace(":", "_").Replace(".", "_").ToUpperInvariant();
        }
    }

    /// <summary>
    /// JWT settings model
    /// </summary>
    public class JwtSettings
    {
        public string Secret { get; set; } = string.Empty;
        public string ValidIssuer { get; set; } = string.Empty;
        public string ValidAudience { get; set; } = string.Empty;
    }

    /// <summary>
    /// Razorpay settings model
    /// </summary>
    public class RazorpaySettings
    {
        public string Key { get; set; } = string.Empty;
        public string Secret { get; set; } = string.Empty;
        public string WebhookSecret { get; set; } = string.Empty;
    }

    /// <summary>
    /// SMTP settings model
    /// </summary>
    public class SmtpSettings
    {
        public string Host { get; set; } = string.Empty;
        public int Port { get; set; } = 587;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public bool EnableSsl { get; set; } = true;
    }
}
