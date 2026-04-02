namespace FECommon.DTO
{
    /// <summary>
    /// Standardized API response wrapper for consistent response format
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        
        // Support flat errors (like "Database connection failed")
        public List<string>? Errors { get; set; }
        
        // Support field-specific validation errors (e.g., "Email": ["Invalid format"])
        public Dictionary<string, string[]>? ValidationErrors { get; set; }
        
        public string? TraceId { get; set; }
        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        public static ApiResponse<T> Ok(T data, string message = "Operation completed successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data
            };
        }

        public static ApiResponse<T> Ok(string message = "Operation completed successfully")
        {
            return new ApiResponse<T>
            {
                Success = true,
                Message = message
            };
        }

        public static ApiResponse<T> Fail(string message, List<string>? errors = null)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }

        public static ApiResponse<T> Fail(string message, string error)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                Errors = new List<string> { error }
            };
        }

        public static ApiResponse<T> Fail(string message, Dictionary<string, string[]> validationErrors)
        {
            return new ApiResponse<T>
            {
                Success = false,
                Message = message,
                ValidationErrors = validationErrors
            };
        }
    }

    /// <summary>
    /// Non-generic version for responses without data
    /// </summary>
    public class ApiResponse : ApiResponse<object>
    {
        public static ApiResponse OkResult(string message = "Operation completed successfully")
        {
            return new ApiResponse
            {
                Success = true,
                Message = message
            };
        }

        public static ApiResponse FailResult(string message, List<string>? errors = null)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                Errors = errors
            };
        }

        public static ApiResponse FailResult(string message, Dictionary<string, string[]> validationErrors)
        {
            return new ApiResponse
            {
                Success = false,
                Message = message,
                ValidationErrors = validationErrors
            };
        }
    }

    /// <summary>
    /// Paged response wrapper for pagination support
    /// </summary>
    public class PagedApiResponse<T> : ApiResponse<T>
    {
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasPrevious => Page > 1;
        public bool HasNext => Page < TotalPages;

        public static PagedApiResponse<T> Ok(T data, int totalCount, int page, int pageSize, string message = "Data retrieved successfully")
        {
            return new PagedApiResponse<T>
            {
                Success = true,
                Message = message,
                Data = data,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            };
        }
    }
}
