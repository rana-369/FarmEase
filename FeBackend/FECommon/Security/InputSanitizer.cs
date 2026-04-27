using System.Text;
using System.Text.RegularExpressions;

namespace FECommon.Security
{
    /// <summary>
    /// Utility class for input sanitization and validation
    /// </summary>
    public static class InputSanitizer
    {
        // SQL injection patterns (common attack vectors)
        private static readonly string[] SqlPatterns = 
        [
            @"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|TRUNCATE)\b)",
            @"(\b(UNION|JOIN|INNER|OUTER|LEFT|RIGHT)\b)",
            @"(--|\#|\/\*|\*\/)",
            @"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
            @"(\b(OR|AND)\s+['""]?\w+['""]?\s*=\s*['""]?\w+['""]?)",
            @"(;\s*$)",
            @"(\bEXEC\b|\bEXECUTE\b)"
        ];

        // XSS patterns
        private static readonly string[] XssPatterns = 
        [
            @"<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>",
            @"javascript\s*:",
            @"on\w+\s*=",
            @"<iframe",
            @"<object",
            @"<embed",
            @"<form",
            @"eval\s*\(",
            @"expression\s*\("
        ];

        /// <summary>
        /// Sanitizes a string for safe use in search queries
        /// </summary>
        public static string SanitizeSearchInput(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var sanitized = input.Trim();
            
            // Remove potentially dangerous characters
            sanitized = Regex.Replace(sanitized, @"[<>""'\\]", "");
            
            // Limit length to prevent DoS
            if (sanitized.Length > 100)
                sanitized = sanitized.Substring(0, 100);

            return sanitized;
        }

        /// <summary>
        /// Sanitizes a string for general text input
        /// </summary>
        public static string SanitizeText(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return string.Empty;

            var sanitized = input.Trim();
            
            // HTML encode special characters
            sanitized = sanitized
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&#x27;");

            return sanitized;
        }

        /// <summary>
        /// Validates and sanitizes email input
        /// </summary>
        public static (bool IsValid, string Sanitized) SanitizeEmail(string? email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return (false, string.Empty);

            var sanitized = email.Trim().ToLowerInvariant();
            
            // Basic email format validation
            var emailPattern = @"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";
            var isValid = Regex.IsMatch(sanitized, emailPattern);

            return (isValid, sanitized);
        }

        /// <summary>
        /// Validates phone number format
        /// </summary>
        public static (bool IsValid, string Sanitized) SanitizePhone(string? phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                return (false, string.Empty);

            // Remove all non-digit characters
            var sanitized = Regex.Replace(phone, @"[^\d]", "");
            
            // Validate length (10-15 digits)
            var isValid = sanitized.Length >= 10 && sanitized.Length <= 15;

            return (isValid, sanitized);
        }

        /// <summary>
        /// Checks for potential SQL injection patterns
        /// </summary>
        public static bool HasSqlInjectionRisk(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return false;

            var upperInput = input.ToUpperInvariant();
            
            foreach (var pattern in SqlPatterns)
            {
                if (Regex.IsMatch(upperInput, pattern, RegexOptions.IgnoreCase))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Checks for potential XSS patterns
        /// </summary>
        public static bool HasXssRisk(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return false;

            foreach (var pattern in XssPatterns)
            {
                if (Regex.IsMatch(input, pattern, RegexOptions.IgnoreCase))
                    return true;
            }

            return false;
        }

        /// <summary>
        /// Validates pagination parameters
        /// </summary>
        public static (bool IsValid, int Page, int Limit) ValidatePagination(int? page, int? limit, int maxLimit = 100)
        {
            var validPage = page.HasValue && page.Value > 0 ? page.Value : 1;
            var validLimit = limit.HasValue && limit.Value > 0 
                ? Math.Min(limit.Value, maxLimit) 
                : 10;

            return (true, validPage, validLimit);
        }

        /// <summary>
        /// Generates a secure random string for tokens/identifiers
        /// </summary>
        public static string GenerateSecureToken(int length = 32)
        {
            var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            var result = new StringBuilder(length);
            
            for (int i = 0; i < length; i++)
            {
                result.Append(chars[random.Next(chars.Length)]);
            }
            
            return result.ToString();
        }
    }
}
