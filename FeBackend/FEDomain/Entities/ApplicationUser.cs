using Microsoft.AspNetCore.Identity;
using System;

namespace FEDomain
{
    public class ApplicationUser : IdentityUser
    {
        public string Role { get; set; } = "farmer";
        public string FullName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public string? ProfileImageUrl { get; set; }
        public string? Location { get; set; }
        public string? FarmSize { get; set; }
        public string? CompanyName { get; set; }
        public string? ResetOtp { get; set; }
        public DateTime? ResetOtpExpiry { get; set; }
        
        // Two-Factor Authentication Fields (TwoFactorEnabled is inherited from IdentityUser)
        public string? TwoFactorMethod { get; set; } = "email";
        public string? TwoFactorSecret { get; set; }
        public string? TwoFactorBackupCodes { get; set; }
        public string? TwoFactorOtp { get; set; }
        public DateTime? TwoFactorOtpExpiry { get; set; }
    }
}