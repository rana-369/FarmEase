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

        // Razorpay Route API - Owner Payment Settlement Fields
        // Stores Razorpay Account ID (not bank details) for secure automatic transfers
        public string? RazorpayAccountId { get; set; }           // Linked account ID for receiving payments (e.g., "acc_xyz123")
        public string? RazorpayContactId { get; set; }          // Contact ID for the owner
        public bool IsPaymentOnboardingComplete { get; set; }   // Whether owner completed Razorpay onboarding
        public DateTime? PaymentOnboardingCompletedAt { get; set; }
        public string? RazorpayFundAccountId { get; set; }      // Fund account ID for bank transfers
    }
}