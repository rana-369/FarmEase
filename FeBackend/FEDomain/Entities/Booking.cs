using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using FECommon.Enums;

namespace FEDomain
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        public int MachineId { get; set; }

        public string? MachineName { get; set; }

        public string FarmerId { get; set; } = string.Empty;

        public string? FarmerName { get; set; }

        public string OwnerId { get; set; } = string.Empty;

        public int Hours { get; set; }

        // Scheduled date and time for the booking
        public DateTime? ScheduledDate { get; set; }

        [MaxLength(10)]
        public string? ScheduledTime { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PlatformFee { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // Stored as string in database, use helper methods for enum
        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Pending";

        // OTP for verifying arrival and work start
        [MaxLength(6)]
        public string? ArrivalOtp { get; set; }

        [MaxLength(6)]
        public string? WorkStartOtp { get; set; }

        public DateTime? OtpGeneratedAt { get; set; }

        [NotMapped]
        public BookingStatus StatusEnum
        {
            get => BookingStatusExtensions.FromString(Status);
            set => Status = value.ToString();
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}