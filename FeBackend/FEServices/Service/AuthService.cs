using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using OtpNet;

namespace FEServices.Service
{
    public class AuthService(
        UserManager<ApplicationUser> userManager,
        IConfiguration configuration,
        IEmailService emailService,
        ILogger<AuthService> logger) : IAuthService
    {
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly IConfiguration _configuration = configuration;
        private readonly IEmailService _emailService = emailService;
        private readonly ILogger<AuthService> _logger = logger;

        public async Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> RegisterAsync(RegisterDto model)
        {
            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
                return (false, "User already exists!", null, null, null);

            var user = new ApplicationUser
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email,
                FullName = model.Name,
                Role = model.Role?.ToLower() ?? "farmer"
            };

            var result = await _userManager.CreateAsync(user, model.Password);
            if (!result.Succeeded)
            {
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                return (false, $"User creation failed! {errors}", null, null, null);
            }

            return (true, "User created successfully!", null, null, null);
        }

        public async Task<(bool Success, string Message, string? Token, string? Role, string? UserId, bool Requires2FA, string? TwoFAMethod)> LoginAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                return (false, "Invalid email or password.", null, null, null, false, null);

            var userRoles = await _userManager.GetRolesAsync(user);
            var actualRole = !string.IsNullOrEmpty(user.Role) ? user.Role.ToLower() : (userRoles.FirstOrDefault()?.ToLower() ?? "farmer");

            // Validate selected role matches actual role
            if (!string.IsNullOrEmpty(model.SelectedRole))
            {
                if (!string.Equals(actualRole, model.SelectedRole, StringComparison.OrdinalIgnoreCase))
                {
                    return (false, $"This account is registered as '{actualRole}'. Please select '{actualRole}' to login.", null, null, null, false, null);
                }
            }

            if (!string.IsNullOrEmpty(user.Role) && user.Role != user.Role.ToLower())
            {
                user.Role = user.Role.ToLower();
                await _userManager.UpdateAsync(user);
            }

            // Check if 2FA is enabled for this user
            if (user.TwoFactorEnabled)
            {
                // Generate and store 2FA OTP for email method
                if (user.TwoFactorMethod == "email")
                {
                    var otp = GenerateSecureOtp();
                    user.TwoFactorOtp = otp;
                    user.TwoFactorOtpExpiry = DateTime.UtcNow.AddMinutes(5);
                    await _userManager.UpdateAsync(user);

                    // Send OTP email
                    await _emailService.Send2FAOtpEmailAsync(user.Email ?? string.Empty, otp);
                    _logger.LogInformation("2FA OTP generated for {Email}", user.Email);
                }
                
                var displayRole = char.ToUpper(actualRole[0]) + actualRole[1..];
                return (true, "Two-factor authentication required.", null, displayRole, user.Id, true, user.TwoFactorMethod);
            }

            // No 2FA - proceed with normal login
            var token = GenerateJwtToken(user, actualRole);
            var displayRoleFinal = char.ToUpper(actualRole[0]) + actualRole[1..];
            return (true, "Login successful", token, displayRoleFinal, user.Id, false, null);
        }

        public async Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> Verify2FAAsync(TwoFactorVerifyDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !user.TwoFactorEnabled)
                return (false, "Invalid request.", null, null, null);

            bool isValidCode = false;

            if (user.TwoFactorMethod == "email")
            {
                // Verify email OTP
                if (user.TwoFactorOtp == model.Code && user.TwoFactorOtpExpiry > DateTime.UtcNow)
                {
                    isValidCode = true;
                    user.TwoFactorOtp = null;
                    user.TwoFactorOtpExpiry = null;
                    await _userManager.UpdateAsync(user);
                }
            }
            else if (user.TwoFactorMethod == "authenticator" && !string.IsNullOrEmpty(user.TwoFactorSecret))
            {
                // Verify TOTP from authenticator app
                var secretKey = Base32Encoding.ToBytes(user.TwoFactorSecret);
                var totp = new Totp(secretKey);
                isValidCode = totp.VerifyTotp(model.Code, out _, new VerificationWindow(2, 2));
            }

            if (!isValidCode)
                return (false, "Invalid or expired verification code.", null, null, null);

            var actualRole = !string.IsNullOrEmpty(user.Role) ? user.Role.ToLower() : "farmer";
            var token = GenerateJwtToken(user, actualRole);
            var displayRole = char.ToUpper(actualRole[0]) + actualRole[1..];
            return (true, "Verification successful.", token, displayRole, user.Id);
        }

        public async Task<(bool Success, string Message)> Resend2FAAsync(TwoFactorResendDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !user.TwoFactorEnabled || user.TwoFactorMethod != "email")
                return (false, "Invalid request.");

            // Rate limiting check - prevent resend within 60 seconds
            if (user.TwoFactorOtpExpiry.HasValue && user.TwoFactorOtpExpiry.Value.AddMinutes(-4) > DateTime.UtcNow)
            {
                return (false, "Please wait before requesting a new code.");
            }

            var otp = GenerateSecureOtp();
            user.TwoFactorOtp = otp;
            user.TwoFactorOtpExpiry = DateTime.UtcNow.AddMinutes(5);
            await _userManager.UpdateAsync(user);

            await _emailService.Send2FAOtpEmailAsync(user.Email ?? string.Empty, otp);
            _logger.LogInformation("2FA OTP resent for {Email}", user.Email);

            return (true, "Verification code sent successfully.");
        }

        public async Task<(bool Success, string Message, string? QrCodeUrl, List<string>? BackupCodes)> Enable2FAAsync(string userId, TwoFactorEnableDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.", null, null);

            if (model.Method == "authenticator")
            {
                // Setup authenticator - generate secret and QR code
                var secretKey = KeyGeneration.GenerateRandomKey(20);
                var base32Secret = Base32Encoding.ToString(secretKey);
                user.TwoFactorSecret = base32Secret;
                
                var backupCodes = GenerateBackupCodes();
                user.TwoFactorBackupCodes = JsonSerializer.Serialize(backupCodes.Select(HashCode).ToList());
                user.TwoFactorMethod = "authenticator";
                user.TwoFactorEnabled = true;
                await _userManager.UpdateAsync(user);

                var issuer = Uri.EscapeDataString("AgriConnect" ?? string.Empty);
                var account = Uri.EscapeDataString(user.Email ?? string.Empty);
                var qrCodeUrl = $"otpauth://totp/{issuer}:{account}?secret={base32Secret}&issuer={issuer}&digits=6&period=30";

                return (true, "Authenticator setup initiated.", qrCodeUrl, backupCodes);
            }
            else
            {
                // Email method - just enable
                user.TwoFactorMethod = "email";
                user.TwoFactorEnabled = true;
                
                var backupCodes = GenerateBackupCodes();
                user.TwoFactorBackupCodes = JsonSerializer.Serialize(backupCodes.Select(HashCode).ToList());
                await _userManager.UpdateAsync(user);

                return (true, "Two-factor authentication enabled.", null, backupCodes);
            }
        }

        public async Task<(bool Success, string Message)> Disable2FAAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            user.TwoFactorEnabled = false;
            user.TwoFactorMethod = null;
            user.TwoFactorSecret = null;
            user.TwoFactorBackupCodes = null;
            user.TwoFactorOtp = null;
            user.TwoFactorOtpExpiry = null;
            await _userManager.UpdateAsync(user);

            return (true, "Two-factor authentication disabled.");
        }

        public async Task<(TwoFactorSettingsDto? Settings, bool Success, string Message)> Get2FASettingsAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (null, false, "User not found.");

            var settings = new TwoFactorSettingsDto
            {
                Enabled = user.TwoFactorEnabled,
                Method = user.TwoFactorMethod
            };

            return (settings, true, "Settings retrieved.");
        }

        public async Task<(bool Success, string Message, string? QrCodeUrl, List<string>? BackupCodes)> SetupAuthenticatorAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.", null, null);

            var secretKey = KeyGeneration.GenerateRandomKey(20);
            var base32Secret = Base32Encoding.ToString(secretKey);
            user.TwoFactorSecret = base32Secret;
            
            var backupCodes = GenerateBackupCodes();
            user.TwoFactorBackupCodes = JsonSerializer.Serialize(backupCodes.Select(HashCode).ToList());
            await _userManager.UpdateAsync(user);

            var issuer = Uri.EscapeDataString("AgriConnect" ?? string.Empty);
            var account = Uri.EscapeDataString(user.Email ?? string.Empty);
            var qrCodeUrl = $"otpauth://totp/{issuer}:{account}?secret={base32Secret}&issuer={issuer}&digits=6&period=30";

            return (true, "Authenticator setup initiated.", qrCodeUrl, backupCodes);
        }

        public async Task<(bool Success, string Message)> VerifyAuthenticatorSetupAsync(string userId, TwoFactorVerifySetupDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null || string.IsNullOrEmpty(user.TwoFactorSecret))
                return (false, "Invalid request.");

            var secretKey = Base32Encoding.ToBytes(user.TwoFactorSecret);
            var totp = new Totp(secretKey);
            var isValid = totp.VerifyTotp(model.Code, out _, new VerificationWindow(2, 2));

            if (!isValid)
                return (false, "Invalid verification code.");

            user.TwoFactorMethod = "authenticator";
            user.TwoFactorEnabled = true;
            await _userManager.UpdateAsync(user);

            return (true, "Authenticator app configured successfully.");
        }

        public async Task<(bool Success, string Message, string? Token, string? Role, string? UserId)> VerifyBackupCodeAsync(TwoFactorBackupVerifyDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || string.IsNullOrEmpty(user.TwoFactorBackupCodes))
                return (false, "Invalid request.", null, null, null);

            var hashedCodes = JsonSerializer.Deserialize<List<string>>(user.TwoFactorBackupCodes) ?? [];
            var inputHash = HashCode(model.Code);

            var codeIndex = hashedCodes.FindIndex(c => c == inputHash);
            if (codeIndex == -1)
                return (false, "Invalid backup code.", null, null, null);

            // Remove used backup code
            hashedCodes.RemoveAt(codeIndex);
            user.TwoFactorBackupCodes = JsonSerializer.Serialize(hashedCodes);
            await _userManager.UpdateAsync(user);

            var actualRole = !string.IsNullOrEmpty(user.Role) ? user.Role.ToLower() : "farmer";
            var token = GenerateJwtToken(user, actualRole);
            var displayRole = char.ToUpper(actualRole[0]) + actualRole[1..];
            return (true, "Backup code verified.", token, displayRole, user.Id);
        }

        public async Task<(bool Success, string Message, List<string>? BackupCodes)> RegenerateBackupCodesAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.", null);

            var backupCodes = GenerateBackupCodes();
            user.TwoFactorBackupCodes = JsonSerializer.Serialize(backupCodes.Select(HashCode).ToList());
            await _userManager.UpdateAsync(user);

            return (true, "Backup codes regenerated.", backupCodes);
        }

        public async Task<(bool Success, string Message)> ForgotPasswordAsync(ForgotPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null)
                return (true, "If that email exists, an OTP has been sent.");

            var otp = GenerateSecureOtp();
            user.ResetOtp = otp;
            user.ResetOtpExpiry = DateTime.UtcNow.AddMinutes(15);
            await _userManager.UpdateAsync(user);

            _logger.LogInformation("Password reset OTP generated for {Email}", user.Email);

            _ = await _emailService.SendOtpEmailAsync(user.Email ?? string.Empty, otp);
            
            // Always return same message to prevent email enumeration
            return (true, "If that email exists, an OTP has been sent.");
        }

        public async Task<(bool Success, string Message)> ResetPasswordAsync(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user == null || user.ResetOtp != model.Otp || user.ResetOtpExpiry < DateTime.UtcNow)
                return (false, "Invalid or expired OTP.");

            var resetToken = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, resetToken, model.NewPassword);

            if (result.Succeeded)
            {
                user.ResetOtp = null;
                user.ResetOtpExpiry = null;
                await _userManager.UpdateAsync(user);
                return (true, "Password reset successfully.");
            }

            return (false, "Failed to reset password. Ensure it has uppercase, lowercase, numbers, and symbols.");
        }

        // Helper methods
        private string GenerateJwtToken(ApplicationUser user, string role)
        {
            var safeUserName = user.UserName ?? user.Email ?? "UnknownUser";

            var authClaims = new List<Claim>
            {
                new(ClaimTypes.Name, safeUserName),
                new(ClaimTypes.NameIdentifier, user.Id),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.Role, role),
                new("FullName", user.FullName ?? "User")
            };

            string jwtSecret = _configuration["JWT:Secret"]
                ?? throw new InvalidOperationException("JWT Secret is missing from appsettings.json!");

            var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

            var token = new JwtSecurityToken(
                issuer: _configuration["JWT:ValidIssuer"],
                audience: _configuration["JWT:ValidAudience"],
                expires: DateTime.Now.AddHours(3),
                claims: authClaims,
                signingCredentials: new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private static List<string> GenerateBackupCodes(int count = 8)
        {
            var codes = new List<string>(count);
            
            for (int i = 0; i < count; i++)
            {
                // Use cryptographically secure RNG for backup codes
                var bytes = new byte[9];
                using var rng = RandomNumberGenerator.Create();
                rng.GetBytes(bytes);
                var base64 = Convert.ToBase64String(bytes)
                    .Replace("+", "")
                    .Replace("/", "")
                    .Replace("=", "");
                // Take first 8 chars, pad with 'X' if needed
                var code = (base64.Length >= 8 ? base64[..8] : base64.PadRight(8, 'X'))
                    .ToUpper();
                codes.Add(code);
            }
            
            return codes;
        }

        private static string HashCode(string code)
        {
            var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(code));
            return Convert.ToBase64String(bytes);
        }

        private static string GenerateSecureOtp()
        {
            // Cryptographically secure 6-digit OTP
            var bytes = RandomNumberGenerator.GetBytes(4);
            var number = BitConverter.ToUInt32(bytes, 0) % 900000 + 100000;
            return number.ToString();
        }

        #region OTP for Sensitive Actions

        // In-memory storage for OTPs (in production, use Redis or database)
        private static readonly Dictionary<string, (string OtpHash, DateTime Expiry)> _otpStore = new();

        public async Task<(bool Success, string Message)> SendOtpAsync(string userId, string purpose)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            // Generate 6-digit OTP
            var otp = GenerateSecureOtp();
            var otpHash = HashCode(otp);
            var key = $"{userId}_{purpose}";
            
            // Store OTP with 5-minute expiry
            _otpStore[key] = (otpHash, DateTime.UtcNow.AddMinutes(5));

            // Send OTP via email
            var purposeText = purpose switch
            {
                "payment_update" => "update your payment details",
                "password_change" => "change your password",
                _ => "verify your identity"
            };

            var emailBody = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;'>
                    <h2 style='color: #10b981;'>FarmEase - Verification Code</h2>
                    <p>Hello {user.FullName},</p>
                    <p>You requested to {purposeText}. Please use the following verification code:</p>
                    <div style='background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;'>
                        {otp}
                    </div>
                    <p style='color: #6b7280; font-size: 14px;'>This code will expire in 5 minutes. If you didn't request this, please ignore this email.</p>
                </div>";

            var emailResult = await _emailService.SendEmailAsync(
                user.Email!,
                "FarmEase - Verification Code",
                emailBody
            );

            if (!emailResult)
            {
                _logger.LogError("Failed to send OTP email to {Email}", user.Email);
                return (false, "Failed to send verification email. Please try again.");
            }

            _logger.LogInformation("OTP sent to user {UserId} for purpose {Purpose}", userId, purpose);
            return (true, "Verification code sent to your email.");
        }

        public async Task<(bool Success, string Message)> VerifyOtpAsync(string userId, string otp, string purpose)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return (false, "User not found.");

            var key = $"{userId}_{purpose}";
            
            if (!_otpStore.TryGetValue(key, out var stored))
                return (false, "No verification code found. Please request a new one.");

            // Check expiry
            if (DateTime.UtcNow > stored.Expiry)
            {
                _otpStore.Remove(key);
                return (false, "Verification code has expired. Please request a new one.");
            }

            // Verify OTP
            var otpHash = HashCode(otp);
            if (otpHash != stored.OtpHash)
                return (false, "Invalid verification code. Please try again.");

            // Remove used OTP
            _otpStore.Remove(key);
            
            _logger.LogInformation("OTP verified for user {UserId}, purpose {Purpose}", userId, purpose);
            return (true, "Verification successful.");
        }

        #endregion
    }
}
