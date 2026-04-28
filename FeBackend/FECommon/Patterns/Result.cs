namespace FECommon.Patterns
{
    /// <summary>
    /// Result pattern for consistent operation outcomes
    /// Encapsulates success/failure state with data and errors
    /// </summary>
    public class Result<T>
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public T? Data { get; }
        public string? Message { get; }
        public string? Error { get; }
        public string? ErrorCode { get; }
        public List<string> ValidationErrors { get; } = new List<string>();

        private Result(bool isSuccess, T? data, string? message, string? errorCode, List<string>? validationErrors = null)
        {
            IsSuccess = isSuccess;
            Data = data;
            Message = message;
            Error = isSuccess ? null : message;
            ErrorCode = errorCode;
            ValidationErrors = validationErrors ?? new List<string>();
        }

        /// <summary>
        /// Creates a successful result with data
        /// </summary>
        public static Result<T> Success(T data) => new(true, data, null, null);

        /// <summary>
        /// Creates a successful result with data and message
        /// </summary>
        public static Result<T> Success(T data, string message) => new(true, data, message, null);

        /// <summary>
        /// Creates a successful result without data
        /// </summary>
        public static Result<T> Success() => new(true, default, null, null);

        /// <summary>
        /// Creates a failed result with error message
        /// </summary>
        public static Result<T> Failure(string error, string? errorCode = null) 
            => new(false, default, error, errorCode);

        /// <summary>
        /// Creates a failed result with validation errors
        /// </summary>
        public static Result<T> ValidationFailure(List<string> validationErrors, string? errorCode = "VALIDATION_ERROR")
            => new(false, default, "Validation failed", errorCode, validationErrors);

        /// <summary>
        /// Creates a not found result
        /// </summary>
        public static Result<T> NotFound(string message = "Resource not found") 
            => new(false, default, message, "NOT_FOUND");

        /// <summary>
        /// Creates an unauthorized result
        /// </summary>
        public static Result<T> Unauthorized(string message = "Unauthorized access") 
            => new(false, default, message, "UNAUTHORIZED");

        /// <summary>
        /// Maps the data to a new type if successful
        /// </summary>
        public Result<TNew> Map<TNew>(Func<T, TNew> mapper)
        {
            if (IsFailure)
                return Result<TNew>.Failure(Error!, ErrorCode);

            try
            {
                var newData = mapper(Data!);
                return Result<TNew>.Success(newData);
            }
            catch (Exception ex)
            {
                return Result<TNew>.Failure(ex.Message, "MAP_ERROR");
            }
        }

        /// <summary>
        /// Executes action if successful, returns current result
        /// </summary>
        public Result<T> Tap(Action<T> action)
        {
            if (IsSuccess)
                action(Data!);
            return this;
        }

        /// <summary>
        /// Executes function if successful, returns new result
        /// </summary>
        public Result<TNew> Bind<TNew>(Func<T, Result<TNew>> binder)
        {
            if (IsFailure)
                return Result<TNew>.Failure(Error!, ErrorCode);

            return binder(Data!);
        }
    }

    /// <summary>
    /// Non-generic result for operations without return data
    /// </summary>
    public class Result
    {
        public bool IsSuccess { get; }
        public bool IsFailure => !IsSuccess;
        public string? Error { get; }
        public string? ErrorCode { get; }

        private Result(bool isSuccess, string? error, string? errorCode)
        {
            IsSuccess = isSuccess;
            Error = error;
            ErrorCode = errorCode;
        }

        public static Result Success() => new(true, null, null);
        public static Result Failure(string error, string? errorCode = null) => new(false, error, errorCode);
        public static Result NotFound(string message = "Resource not found") => new(false, message, "NOT_FOUND");
        public static Result Unauthorized(string message = "Unauthorized access") => new(false, message, "UNAUTHORIZED");
    }
}
