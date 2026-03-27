using FEDTO.DTOs;

namespace FEServices.Interface
{
    public interface IAuthService
    {
        Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> RegisterAsync(RegisterDto model);
        Task<(bool Success, string Message, string? Token, string? Role, string? UserId, bool Requires2FA, string? TwoFAMethod)> LoginAsync(LoginDto model);
        Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordDto model);
        Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto model);
        
        // Two-Factor Authentication Methods
        Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> Verify2FAAsync(TwoFactorVerifyDto model);
        Task<(bool Success, string Message)> Resend2FAAsync(TwoFactorResendDto model);
        Task<(bool Success, string Message, string? QrCodeUrl, List<string>? BackupCodes)> Enable2FAAsync(string userId, TwoFactorEnableDto model);
        Task<(bool Success, string Message)> Disable2FAAsync(string userId);
        Task<(TwoFactorSettingsDto? Settings, bool Success, string Message)> Get2FASettingsAsync(string userId);
        Task<(bool Success, string Message, string? QrCodeUrl, List<string>? BackupCodes)> SetupAuthenticatorAsync(string userId);
        Task<(bool Success, string Message)> VerifyAuthenticatorSetupAsync(string userId, TwoFactorVerifySetupDto model);
        Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> VerifyBackupCodeAsync(TwoFactorBackupVerifyDto model);
        Task<(bool Success, string Message, List<string>? BackupCodes)> RegenerateBackupCodesAsync(string userId);
    }
}
