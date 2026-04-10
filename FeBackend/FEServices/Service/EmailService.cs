using MailKit.Net.Smtp;
using MimeKit;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace FEServices.Service
{
    public interface IEmailService
    {
        Task<bool> SendOtpEmailAsync(string toEmail, string otp);
        Task<bool> Send2FAOtpEmailAsync(string toEmail, string otp);
    }

    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> SendOtpEmailAsync(string toEmail, string otp)
        {
            if (string.IsNullOrEmpty(toEmail))
                return false;
            
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var host = smtpSettings["Host"] ?? "smtp.gmail.com";
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var email = smtpSettings["Email"] ?? "";
                var password = smtpSettings["Password"] ?? "";
                var useSsl = bool.Parse(smtpSettings["UseSsl"] ?? "false"); // Typically false for STARTTLS on port 587

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    _logger.LogWarning("SMTP settings not configured. OTP not sent via email.");
                    return false;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("AgriConnect", email));
                message.To.Add(new MailboxAddress(toEmail, toEmail));
                message.Subject = "Password Reset OTP - AgriConnect";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #22c55e; }}
        .otp-box {{ background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; }}
        .info {{ color: #666; font-size: 14px; margin-top: 20px; }}
        .warning {{ color: #ef4444; font-size: 12px; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 AgriConnect</div>
        </div>
        
        <h2 style='color: #333; margin-bottom: 10px;'>Password Reset Request</h2>
        <p style='color: #666;'>You requested to reset your password. Use the OTP code below to proceed:</p>
        
        <div class='otp-box'>
            <div class='otp-code'>{otp}</div>
        </div>
        
        <p class='info'>This code is valid for <strong>15 minutes</strong>.</p>
        <p class='warning'>⚠️ If you didn't request this, please ignore this email. Never share this code with anyone.</p>
        
        <div class='footer'>
            <p>© 2026 AgriConnect - Agricultural Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>"
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Connect with proper SSL/TLS settings
                await client.ConnectAsync(host, port, useSsl ? MailKit.Security.SecureSocketOptions.SslOnConnect : MailKit.Security.SecureSocketOptions.StartTls);
                
                // Authenticate
                await client.AuthenticateAsync(email, password);
                
                // Send
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation("OTP email sent successfully to {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send OTP email to {Email}", toEmail);
                return false;
            }
        }

        public async Task<bool> Send2FAOtpEmailAsync(string toEmail, string otp)
        {
            if (string.IsNullOrEmpty(toEmail))
                return false;
            
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var host = smtpSettings["Host"] ?? "smtp.gmail.com";
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var email = smtpSettings["Email"] ?? "";
                var password = smtpSettings["Password"] ?? "";
                var useSsl = bool.Parse(smtpSettings["UseSsl"] ?? "false");

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    _logger.LogWarning("SMTP settings not configured. 2FA OTP not sent via email.");
                    return false;
                }

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress("AgriConnect", email));
                message.To.Add(new MailboxAddress(toEmail, toEmail));
                message.Subject = "Your Verification Code - AgriConnect";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }}
        .container {{ max-width: 500px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
        .header {{ text-align: center; margin-bottom: 20px; }}
        .logo {{ font-size: 24px; font-weight: bold; color: #22c55e; }}
        .otp-box {{ background: #f0fdf4; border: 2px dashed #22c55e; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }}
        .otp-code {{ font-size: 32px; font-weight: bold; color: #22c55e; letter-spacing: 8px; }}
        .info {{ color: #666; font-size: 14px; margin-top: 20px; }}
        .warning {{ color: #ef4444; font-size: 12px; margin-top: 15px; }}
        .footer {{ text-align: center; margin-top: 30px; color: #999; font-size: 12px; }}
        .shield {{ font-size: 40px; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <div class='logo'>🌾 AgriConnect</div>
            <div class='shield'>🛡️</div>
        </div>
        
        <h2 style='color: #333; margin-bottom: 10px;'>Two-Factor Authentication</h2>
        <p style='color: #666;'>Use the verification code below to complete your login:</p>
        
        <div class='otp-box'>
            <div class='otp-code'>{otp}</div>
        </div>
        
        <p class='info'>This code is valid for <strong>5 minutes</strong>.</p>
        <p class='warning'>⚠️ If you didn't attempt to login, please secure your account immediately. Never share this code with anyone.</p>
        
        <div class='footer'>
            <p>© 2026 AgriConnect - Agricultural Equipment Rental Platform</p>
        </div>
    </div>
</body>
</html>"
                };
                message.Body = bodyBuilder.ToMessageBody();

                using var client = new SmtpClient();
                
                // Connect with proper SSL/TLS settings
                await client.ConnectAsync(host, port, useSsl ? MailKit.Security.SecureSocketOptions.SslOnConnect : MailKit.Security.SecureSocketOptions.StartTls);
                
                // Authenticate
                await client.AuthenticateAsync(email, password);
                
                // Send
                await client.SendAsync(message);
                await client.DisconnectAsync(true);
                
                _logger.LogInformation("2FA OTP email sent successfully to {Email}", toEmail);
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send 2FA email to {Email}", toEmail);
                return false;
            }
        }
    }
}
