using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;

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

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> SendOtpEmailAsync(string toEmail, string otp)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var host = smtpSettings["Host"] ?? "smtp.gmail.com";
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var email = smtpSettings["Email"] ?? "";
                var password = smtpSettings["Password"] ?? "";
                var enableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true");

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    Console.WriteLine("SMTP settings not configured. OTP not sent via email.");
                    return false;
                }

                using var client = new SmtpClient(host, port);
                client.EnableSsl = enableSsl;
                client.Credentials = new NetworkCredential(email, password);
                client.DeliveryMethod = SmtpDeliveryMethod.Network;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(email, "AgriConnect"),
                    Subject = "Password Reset OTP - AgriConnect",
                    Body = $@"
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
</html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"OTP email sent successfully to {toEmail}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send email: {ex.Message}");
                return false;
            }
        }

        public async Task<bool> Send2FAOtpEmailAsync(string toEmail, string otp)
        {
            try
            {
                var smtpSettings = _configuration.GetSection("SmtpSettings");
                var host = smtpSettings["Host"] ?? "smtp.gmail.com";
                var port = int.Parse(smtpSettings["Port"] ?? "587");
                var email = smtpSettings["Email"] ?? "";
                var password = smtpSettings["Password"] ?? "";
                var enableSsl = bool.Parse(smtpSettings["EnableSsl"] ?? "true");

                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    Console.WriteLine("SMTP settings not configured. 2FA OTP not sent via email.");
                    return false;
                }

                using var client = new SmtpClient(host, port);
                client.EnableSsl = enableSsl;
                client.Credentials = new NetworkCredential(email, password);
                client.DeliveryMethod = SmtpDeliveryMethod.Network;

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(email, "AgriConnect"),
                    Subject = "Your Verification Code - AgriConnect",
                    Body = $@"
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
</html>",
                    IsBodyHtml = true
                };

                mailMessage.To.Add(toEmail);

                await client.SendMailAsync(mailMessage);
                Console.WriteLine($"2FA OTP email sent successfully to {toEmail}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Failed to send 2FA email: {ex.Message}");
                return false;
            }
        }
    }
}
