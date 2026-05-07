using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Asp.Versioning;
using FEServices.Interface;

namespace FarmEase.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
[ApiVersion("1.0")]
[ApiVersion("2.0")]
[EnableRateLimiting("AuthPolicy")]
public class SmsController : ControllerBase
{
    private readonly ISmsService _smsService;
    private readonly ILogger<SmsController> _logger;

    public SmsController(ISmsService smsService, ILogger<SmsController> logger)
    {
        _smsService = smsService;
        _logger = logger;
    }

    /// <summary>
    /// Send OTP to phone number for verification
    /// </summary>
    [HttpPost("send-otp")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    [AllowAnonymous]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber))
        {
            return BadRequest(new { success = false, message = "Phone number is required" });
        }

        _logger.LogInformation("OTP request for phone: {Phone}", MaskPhone(request.PhoneNumber));

        var result = await _smsService.SendOtpAsync(
            request.PhoneNumber, 
            request.CustomMessage);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = "OTP sent successfully",
                otpId = result.OtpId,
                expiresIn = 600 // 10 minutes in seconds
            });
        }

        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Verify OTP code
    /// </summary>
    [HttpPost("verify-otp")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    [AllowAnonymous]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.OtpCode))
        {
            return BadRequest(new { success = false, message = "Phone number and OTP code are required" });
        }

        _logger.LogInformation("OTP verification for phone: {Phone}", MaskPhone(request.PhoneNumber));

        var result = await _smsService.VerifyOtpAsync(
            request.PhoneNumber, 
            request.OtpCode);

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = "OTP verified successfully",
                verified = true
            });
        }

        return BadRequest(new { success = false, message = result.Message, verified = false });
    }

    /// <summary>
    /// Send booking OTP (arrival or work start)
    /// </summary>
    [HttpPost("booking-otp")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    [Authorize]
    public async Task<IActionResult> SendBookingOtp([FromBody] SendBookingOtpRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.PhoneNumber) || string.IsNullOrWhiteSpace(request.OtpType))
        {
            return BadRequest(new { success = false, message = "Phone number and OTP type are required" });
        }

        if (request.OtpType.ToLower() != "arrival" && request.OtpType.ToLower() != "workstart")
        {
            return BadRequest(new { success = false, message = "OTP type must be 'arrival' or 'workstart'" });
        }

        _logger.LogInformation("Booking OTP ({Type}) request for phone: {Phone}", 
            request.OtpType, MaskPhone(request.PhoneNumber));

        var result = await _smsService.SendBookingOtpAsync(
            request.PhoneNumber, 
            request.OtpType, 
            request.MachineName ?? "Equipment");

        if (result.Success)
        {
            return Ok(new
            {
                success = true,
                message = result.Message,
                otp = result.Otp, // Return OTP for testing, remove in production
                otpType = request.OtpType
            });
        }

        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Send booking notification SMS
    /// </summary>
    [HttpPost("booking-notification")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    [Authorize]
    public async Task<IActionResult> SendBookingNotification([FromBody] BookingNotificationRequest request)
    {
        var result = await _smsService.SendBookingNotificationAsync(
            request.PhoneNumber,
            request.MachineName,
            request.Status,
            request.ScheduledDate);

        if (result.Success)
        {
            return Ok(new { success = true, message = result.Message });
        }

        return BadRequest(new { success = false, message = result.Message });
    }

    /// <summary>
    /// Send payment confirmation SMS
    /// </summary>
    [HttpPost("payment-confirmation")]
    [MapToApiVersion("1.0")]
    [MapToApiVersion("2.0")]
    [Authorize]
    public async Task<IActionResult> SendPaymentConfirmation([FromBody] PaymentConfirmationRequest request)
    {
        var result = await _smsService.SendPaymentConfirmationAsync(
            request.PhoneNumber,
            request.Amount,
            request.MachineName);

        if (result.Success)
        {
            return Ok(new { success = true, message = result.Message });
        }

        return BadRequest(new { success = false, message = result.Message });
    }

    private string MaskPhone(string phone)
    {
        if (phone.Length < 6) return phone;
        return phone[..4] + "****" + phone[^2..];
    }
}

// Request DTOs
public class SendOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string? CustomMessage { get; set; }
}

public class VerifyOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class SendBookingOtpRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string OtpType { get; set; } = string.Empty; // "arrival" or "workstart"
    public string? MachineName { get; set; }
}

public class BookingNotificationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public string MachineName { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public DateTime ScheduledDate { get; set; }
}

public class PaymentConfirmationRequest
{
    public string PhoneNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string MachineName { get; set; } = string.Empty;
}
