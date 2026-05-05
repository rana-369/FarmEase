using System;
using System.ComponentModel.DataAnnotations;

namespace FEDTO.DTOs
{
    public class CreateBookingDto
    {
        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "MachineId must be a positive number")]
        public int MachineId { get; set; }

        public string MachineName { get; set; } = string.Empty;

        [Required]
        [Range(1, int.MaxValue, ErrorMessage = "Hours must be at least 1")]
        public int Hours { get; set; }

        // Optional scheduled date and time
        public DateTime? ScheduledDate { get; set; }
        
        public string? ScheduledTime { get; set; }
    }

    public class BookingResponseDto
    {
        public int Id { get; set; }
        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public int Hours { get; set; }
        public DateTime? ScheduledDate { get; set; }
        public string? ScheduledTime { get; set; }
        public decimal BaseAmount { get; set; }
        public decimal PlatformFee { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }

        // OTP fields for farmer
        public string? ArrivalOtp { get; set; }
        public string? WorkStartOtp { get; set; }
    }

    public class UpdateBookingStatusDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }

    public class VerifyOtpDto
    {
        [Required]
        [StringLength(6, MinimumLength = 6, ErrorMessage = "OTP must be 6 digits")]
        public string? Otp { get; set; }
    }
}
