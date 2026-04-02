using System.Security.Claims;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace FarmEase.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [EnableRateLimiting("ApiPolicy")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Register([FromBody] RegisterDto model)
        {
            var (success, message, _, _, _) = await _authService.RegisterAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("login")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> Login([FromBody] LoginDto model)
        {
            var (success, message, token, role, userId, requires2FA, twoFAMethod) = await _authService.LoginAsync(model);
            if (!success)
                return Unauthorized(new { Message = message });

            // Check if 2FA is required
            if (requires2FA)
            {
                return Ok(new { 
                    Requires2FA = true, 
                    TwoFAMethod = twoFAMethod,
                    Role = role,
                    Email = model.Email,
                    Message = message 
                });
            }

            return Ok(new { Token = token, Role = role, UserId = userId });
        }

        [HttpPost("forgot-password")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto model)
        {
            var (success, message) = await _authService.ForgotPasswordAsync(model);
            return Ok(new { Message = message });
        }

        [HttpPost("reset-password")]
        [EnableRateLimiting("AuthPolicy")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto model)
        {
            var (success, message) = await _authService.ResetPasswordAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        #region Two-Factor Authentication Endpoints

        [HttpPost("2fa/verify")]
        public async Task<IActionResult> Verify2FA([FromBody] TwoFactorVerifyDto model)
        {
            var (success, message, token, role, userId) = await _authService.Verify2FAAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Token = token, Role = role, UserId = userId });
        }

        [HttpPost("2fa/resend")]
        public async Task<IActionResult> Resend2FA([FromBody] TwoFactorResendDto model)
        {
            var (success, message) = await _authService.Resend2FAAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpGet("2fa/settings")]
        [Authorize]
        public async Task<IActionResult> Get2FASettings()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (settings, success, message) = await _authService.Get2FASettingsAsync(userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(settings);
        }

        [HttpPost("2fa/enable")]
        [Authorize]
        public async Task<IActionResult> Enable2FA([FromBody] TwoFactorEnableDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message, qrCodeUrl, backupCodes) = await _authService.Enable2FAAsync(userId, model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { 
                Message = message, 
                QrCodeUrl = qrCodeUrl, 
                BackupCodes = backupCodes 
            });
        }

        [HttpPost("2fa/disable")]
        [Authorize]
        public async Task<IActionResult> Disable2FA()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message) = await _authService.Disable2FAAsync(userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("2fa/setup-authenticator")]
        [Authorize]
        public async Task<IActionResult> SetupAuthenticator()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message, qrCodeUrl, backupCodes) = await _authService.SetupAuthenticatorAsync(userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { 
                Message = message, 
                QrCodeUrl = qrCodeUrl, 
                BackupCodes = backupCodes 
            });
        }

        [HttpPost("2fa/verify-authenticator-setup")]
        [Authorize]
        public async Task<IActionResult> VerifyAuthenticatorSetup([FromBody] TwoFactorVerifySetupDto model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message) = await _authService.VerifyAuthenticatorSetupAsync(userId, model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("2fa/verify-backup")]
        public async Task<IActionResult> VerifyBackupCode([FromBody] TwoFactorBackupVerifyDto model)
        {
            var (success, message, token, role, userId) = await _authService.VerifyBackupCodeAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Token = token, Role = role, UserId = userId });
        }

        [HttpGet("2fa/backup-codes")]
        [Authorize]
        public async Task<IActionResult> GetBackupCodes()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userId))
                return Unauthorized(new { Message = "User not authenticated." });

            var (success, message, backupCodes) = await _authService.RegenerateBackupCodesAsync(userId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { BackupCodes = backupCodes });
        }

        #endregion
    }
}
