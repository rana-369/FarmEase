namespace FECommon.Exceptions
{
    /// <summary>
    /// Base exception for all application-specific exceptions
    /// </summary>
    public class AppException : Exception
    {
        public int StatusCode { get; }
        public string ErrorCode { get; }

        public AppException(string message, int statusCode = 500, string errorCode = "INTERNAL_ERROR") 
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }

        public AppException(string message, Exception innerException, int statusCode = 500, string errorCode = "INTERNAL_ERROR") 
            : base(message, innerException)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }

    /// <summary>
    /// Exception for resource not found scenarios
    /// </summary>
    public class NotFoundException : AppException
    {
        public NotFoundException(string resource, object key) 
            : base($"{resource} with key '{key}' was not found.", 404, "NOT_FOUND")
        {
        }

        public NotFoundException(string message) 
            : base(message, 404, "NOT_FOUND")
        {
        }
    }

    /// <summary>
    /// Exception for validation failures
    /// </summary>
    public class ValidationException : AppException
    {
        public Dictionary<string, string[]> ValidationErrors { get; }

        public ValidationException(string message) 
            : base(message, 400, "VALIDATION_ERROR")
        {
            ValidationErrors = new Dictionary<string, string[]>();
        }

        public ValidationException(Dictionary<string, string[]> errors) 
            : base("One or more validation errors occurred.", 400, "VALIDATION_ERROR")
        {
            ValidationErrors = errors;
        }
    }

    /// <summary>
    /// Exception for unauthorized access scenarios
    /// </summary>
    public class UnauthorizedException : AppException
    {
        public UnauthorizedException(string message = "Unauthorized access") 
            : base(message, 401, "UNAUTHORIZED")
        {
        }
    }

    /// <summary>
    /// Exception for forbidden access scenarios (user authenticated but lacks permission)
    /// </summary>
    public class ForbiddenException : AppException
    {
        public ForbiddenException(string message = "Access denied") 
            : base(message, 403, "FORBIDDEN")
        {
        }
    }

    /// <summary>
    /// Exception for business rule violations
    /// </summary>
    public class BusinessException : AppException
    {
        public BusinessException(string message) 
            : base(message, 422, "BUSINESS_RULE_VIOLATION")
        {
        }
    }

    /// <summary>
    /// Exception for conflict scenarios (e.g., duplicate resource)
    /// </summary>
    public class ConflictException : AppException
    {
        public ConflictException(string message) 
            : base(message, 409, "CONFLICT")
        {
        }
    }

    /// <summary>
    /// Exception for external service failures
    /// </summary>
    public class ExternalServiceException : AppException
    {
        public ExternalServiceException(string serviceName, Exception innerException) 
            : base($"External service '{serviceName}' failed.", innerException, 502, "EXTERNAL_SERVICE_ERROR")
        {
        }
    }
}
