namespace FEDTO.DTOs
{
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string? SelectedRole { get; set; } // Role user is trying to login as
    }

    public class RegisterDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string Role { get; set; } = "farmer";
    }

    public class ForgotPasswordDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class ResetPasswordDto
    {
        public string Email { get; set; } = string.Empty;
        public string Otp { get; set; } = string.Empty;
        public string NewPassword { get; set; } = string.Empty;
    }

    // Two-Factor Authentication DTOs
    public class TwoFactorVerifyDto
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class TwoFactorResendDto
    {
        public string Email { get; set; } = string.Empty;
    }

    public class TwoFactorEnableDto
    {
        public string Method { get; set; } = "email"; // "email" or "authenticator"
    }

    public class TwoFactorDisableDto
    {
        public string? Password { get; set; }
    }

    public class TwoFactorVerifySetupDto
    {
        public string Code { get; set; } = string.Empty;
    }

    public class TwoFactorBackupVerifyDto
    {
        public string Email { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
    }

    public class TwoFactorSettingsDto
    {
        public bool Enabled { get; set; }
        public string? Method { get; set; }
    }
}
