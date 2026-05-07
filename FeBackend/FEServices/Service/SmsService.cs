using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Types;
using FEServices.Interface;

namespace FEServices.Service;

/// <summary>
/// SMS service supporting Twilio and MSG91 providers for OTP and notifications
/// </summary>
public class SmsService : ISmsService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmsService> _logger;
    private readonly HttpClient _httpClient;
    private readonly string _provider;
    private readonly string _twilioAccountSid;
    private readonly string _twilioAuthToken;
    private readonly string _twilioPhoneNumber;
    private readonly string _msg91ApiKey;
    private readonly string _msg91SenderId;
    private readonly string _msg91OtpTemplateId;
    private readonly int _otpLength;
    private readonly int _otpExpiryMinutes;
    private readonly Dictionary<string, (string Otp, DateTime Expiry)> _otpStore = new();

    public SmsService(IConfiguration configuration, ILogger<SmsService> logger, HttpClient httpClient)
    {
        _configuration = configuration;
        _logger = logger;
        _httpClient = httpClient;
        
        // SMS Provider configuration
        _provider = configuration["SmsSettings:Provider"] ?? "Twilio";
        
        // Twilio configuration
        _twilioAccountSid = configuration["SmsSettings:Twilio:AccountSid"] ?? "";
        _twilioAuthToken = configuration["SmsSettings:Twilio:AuthToken"] ?? "";
        _twilioPhoneNumber = configuration["SmsSettings:Twilio:PhoneNumber"] ?? "";
        
        // MSG91 configuration
        _msg91ApiKey = configuration["SmsSettings:MSG91:ApiKey"] ?? "";
        _msg91SenderId = configuration["SmsSettings:MSG91:SenderId"] ?? "FARMEAS";
        _msg91OtpTemplateId = configuration["SmsSettings:MSG91:OtpTemplateId"] ?? "";
        
        // OTP configuration
        _otpLength = configuration.GetValue("SmsSettings:OtpLength", 6);
        _otpExpiryMinutes = configuration.GetValue("SmsSettings:OtpExpiryMinutes", 10);
    }

    public async Task<(bool Success, string Message, string? OtpId)> SendOtpAsync(string phoneNumber, string? message = null)
    {
        try
        {
            // Normalize phone number (add +91 for India if not present)
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);
            
            // Generate OTP
            var otp = GenerateOtp();
            var otpId = Guid.NewGuid().ToString();
            
            // Store OTP with expiry
            _otpStore[normalizedPhone] = (otp, DateTime.UtcNow.AddMinutes(_otpExpiryMinutes));
            
            // Prepare message
            var smsMessage = message ?? $"Your FarmEase verification code is {otp}. Valid for {_otpExpiryMinutes} minutes. Do not share with anyone.";
            
            _logger.LogInformation("Sending OTP to {Phone} via {Provider}", MaskPhoneNumber(normalizedPhone), _provider);
            
            // Send via configured provider
            var (success, resultMessage, messageId) = _provider.ToLowerInvariant() switch
            {
                "msg91" => await SendViaMsg91Async(normalizedPhone, smsMessage, otp),
                "twilio" => await SendViaTwilioAsync(normalizedPhone, smsMessage),
                _ => await SendViaTwilioAsync(normalizedPhone, smsMessage)
            };
            
            if (success)
            {
                _logger.LogInformation("OTP sent successfully to {Phone}. MessageId: {MessageId}", 
                    MaskPhoneNumber(normalizedPhone), messageId);
                return (true, "OTP sent successfully", otpId);
            }
            
            _logger.LogWarning("Failed to send OTP to {Phone}: {Message}", 
                MaskPhoneNumber(normalizedPhone), resultMessage);
            return (false, resultMessage, null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending OTP to {Phone}", MaskPhoneNumber(phoneNumber));
            return (false, $"Failed to send OTP: {ex.Message}", null);
        }
    }

    public async Task<(bool Success, string Message)> VerifyOtpAsync(string phoneNumber, string otpCode)
    {
        try
        {
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);
            
            if (!_otpStore.TryGetValue(normalizedPhone, out var storedOtp))
            {
                _logger.LogWarning("OTP verification failed - no OTP found for {Phone}", 
                    MaskPhoneNumber(normalizedPhone));
                return (false, "No OTP found for this phone number. Please request a new OTP.");
            }
            
            // Check expiry
            if (DateTime.UtcNow > storedOtp.Expiry)
            {
                _otpStore.Remove(normalizedPhone);
                _logger.LogWarning("OTP verification failed - expired for {Phone}", 
                    MaskPhoneNumber(normalizedPhone));
                return (false, "OTP has expired. Please request a new OTP.");
            }
            
            // Verify OTP
            if (storedOtp.Otp != otpCode)
            {
                _logger.LogWarning("OTP verification failed - invalid code for {Phone}", 
                    MaskPhoneNumber(normalizedPhone));
                return (false, "Invalid OTP. Please try again.");
            }
            
            // Remove used OTP
            _otpStore.Remove(normalizedPhone);
            _logger.LogInformation("OTP verified successfully for {Phone}", 
                MaskPhoneNumber(normalizedPhone));
            
            return await Task.FromResult((true, "OTP verified successfully"));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error verifying OTP for {Phone}", MaskPhoneNumber(phoneNumber));
            return (false, $"OTP verification failed: {ex.Message}");
        }
    }

    public async Task<(bool Success, string Message, string? MessageId)> SendSmsAsync(string phoneNumber, string message)
    {
        try
        {
            var normalizedPhone = NormalizePhoneNumber(phoneNumber);
            
            _logger.LogInformation("Sending SMS to {Phone} via {Provider}", 
                MaskPhoneNumber(normalizedPhone), _provider);
            
            return _provider.ToLowerInvariant() switch
            {
                "msg91" => await SendViaMsg91Async(normalizedPhone, message, null),
                "twilio" => await SendViaTwilioAsync(normalizedPhone, message),
                _ => await SendViaTwilioAsync(normalizedPhone, message)
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending SMS to {Phone}", MaskPhoneNumber(phoneNumber));
            return (false, ex.Message, null);
        }
    }

    public async Task<(bool Success, string Message)> SendBookingNotificationAsync(
        string phoneNumber, string machineName, string status, DateTime scheduledDate)
    {
        var message = $"FarmEase: Your booking for {machineName} is {status}. " +
                      $"Scheduled for {scheduledDate:dd MMM yyyy}. " +
                      $"Check your app for details.";
        
        var (success, resultMessage, _) = await SendSmsAsync(phoneNumber, message);
        return (success, resultMessage);
    }

    public async Task<(bool Success, string Message)> SendPaymentConfirmationAsync(
        string phoneNumber, decimal amount, string machineName)
    {
        var message = $"FarmEase: Payment of ₹{amount:N0} confirmed for {machineName}. " +
                      $"Thank you for using FarmEase!";
        
        var (success, resultMessage, _) = await SendSmsAsync(phoneNumber, message);
        return (success, resultMessage);
    }

    public async Task<(bool Success, string Message, string Otp)> SendBookingOtpAsync(
        string phoneNumber, string otpType, string machineName)
    {
        var otp = GenerateOtp();
        var normalizedPhone = NormalizePhoneNumber(phoneNumber);
        
        // Store OTP
        _otpStore[$"{normalizedPhone}_{otpType}"] = (otp, DateTime.UtcNow.AddMinutes(_otpExpiryMinutes));
        
        var message = otpType.ToLowerInvariant() switch
        {
            "arrival" => $"FarmEase: Your arrival OTP for {machineName} is {otp}. Share with the farmer when you arrive.",
            "workstart" => $"FarmEase: Your work start OTP for {machineName} is {otp}. Share with the farmer to begin work.",
            _ => $"FarmEase: Your OTP for {machineName} is {otp}."
        };
        
        var (success, resultMessage, _) = await SendSmsAsync(phoneNumber, message);
        
        if (success)
            return (true, resultMessage, otp);
        
        return (false, resultMessage, otp);
    }

    private async Task<(bool Success, string Message, string? MessageId)> SendViaTwilioAsync(
        string phoneNumber, string message)
    {
        try
        {
            if (string.IsNullOrEmpty(_twilioAccountSid) || string.IsNullOrEmpty(_twilioAuthToken))
            {
                _logger.LogWarning("Twilio credentials not configured. SMS would be sent to: {Phone}", 
                    MaskPhoneNumber(phoneNumber));
                // In development, simulate success
                return (true, "SMS simulated (Twilio not configured)", Guid.NewGuid().ToString());
            }
            
            TwilioClient.Init(_twilioAccountSid, _twilioAuthToken);
            
            var messageResource = await MessageResource.CreateAsync(
                body: message,
                from: new PhoneNumber(_twilioPhoneNumber),
                to: new PhoneNumber(phoneNumber)
            );
            
            if (messageResource.ErrorCode == null)
            {
                return (true, "SMS sent successfully", messageResource.Sid);
            }
            
            return (false, $"Twilio error: {messageResource.ErrorMessage}", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Twilio SMS failed for {Phone}", MaskPhoneNumber(phoneNumber));
            return (false, ex.Message, null);
        }
    }

    private async Task<(bool Success, string Message, string? MessageId)> SendViaMsg91Async(
        string phoneNumber, string message, string? otp)
    {
        try
        {
            if (string.IsNullOrEmpty(_msg91ApiKey))
            {
                _logger.LogWarning("MSG91 API key not configured. SMS would be sent to: {Phone}", 
                    MaskPhoneNumber(phoneNumber));
                return (true, "SMS simulated (MSG91 not configured)", Guid.NewGuid().ToString());
            }
            
            // Remove + from phone number for MSG91
            var phoneWithoutPlus = phoneNumber.TrimStart('+');
            
            // MSG91 API endpoint
            var url = "https://api.msg91.com/api/v5/flow/";
            
            // Prepare payload for MSG91 flow API
            var payload = new
            {
                template_id = _msg91OtpTemplateId,
                short_url = "1", // Enable tracking
                mobiles = phoneWithoutPlus,
                otp = otp ?? GenerateOtp(),
                message = message
            };
            
            var jsonPayload = JsonSerializer.Serialize(payload);
            var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");
            
            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("authkey", _msg91ApiKey);
            
            var response = await _httpClient.PostAsync(url, content);
            var responseBody = await response.Content.ReadAsStringAsync();
            
            if (response.IsSuccessStatusCode)
            {
                var responseJson = JsonDocument.Parse(responseBody);
                var requestId = responseJson.RootElement.GetProperty("requestId").GetString();
                return (true, "SMS sent successfully via MSG91", requestId);
            }
            
            _logger.LogError("MSG91 SMS failed: {Response}", responseBody);
            return (false, $"MSG91 error: {responseBody}", null);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "MSG91 SMS failed for {Phone}", MaskPhoneNumber(phoneNumber));
            return (false, ex.Message, null);
        }
    }

    private string GenerateOtp()
    {
        var random = new Random();
        var otp = random.Next((int)Math.Pow(10, _otpLength - 1), (int)Math.Pow(10, _otpLength) - 1);
        return otp.ToString($"D{_otpLength}");
    }

    private string NormalizePhoneNumber(string phoneNumber)
    {
        // Remove spaces and dashes
        var cleaned = phoneNumber.Replace(" ", "").Replace("-", "");
        
        // Add +91 for Indian numbers if not present
        if (cleaned.StartsWith("+"))
            return cleaned;
        
        if (cleaned.StartsWith("91") && cleaned.Length == 12)
            return "+" + cleaned;
        
        if (cleaned.Length == 10)
            return "+91" + cleaned;
        
        return "+" + cleaned;
    }

    private string MaskPhoneNumber(string phoneNumber)
    {
        if (phoneNumber.Length < 6)
            return phoneNumber;
        
        return phoneNumber[..4] + "****" + phoneNumber[^2..];
    }
}
