namespace FEServices.Interface;

/// <summary>
/// SMS service interface for sending OTP and notifications via SMS
/// </summary>
public interface ISmsService
{
    /// <summary>
    /// Send OTP via SMS
    /// </summary>
    Task<(bool Success, string Message, string? OtpId)> SendOtpAsync(string phoneNumber, string? message = null);
    
    /// <summary>
    /// Verify OTP code
    /// </summary>
    Task<(bool Success, string Message)> VerifyOtpAsync(string phoneNumber, string otpCode);
    
    /// <summary>
    /// Send a custom SMS message
    /// </summary>
    Task<(bool Success, string Message, string? MessageId)> SendSmsAsync(string phoneNumber, string message);
    
    /// <summary>
    /// Send booking notification SMS
    /// </summary>
    Task<(bool Success, string Message)> SendBookingNotificationAsync(string phoneNumber, string machineName, string status, DateTime scheduledDate);
    
    /// <summary>
    /// Send payment confirmation SMS
    /// </summary>
    Task<(bool Success, string Message)> SendPaymentConfirmationAsync(string phoneNumber, decimal amount, string machineName);
    
    /// <summary>
    /// Send OTP for booking arrival/work start verification
    /// </summary>
    Task<(bool Success, string Message, string Otp)> SendBookingOtpAsync(string phoneNumber, string otpType, string machineName);
}
