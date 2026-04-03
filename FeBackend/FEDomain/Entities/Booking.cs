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

        [NotMapped]
        public BookingStatus StatusEnum
        {
            get => BookingStatusExtensions.FromString(Status);
            set => Status = value.ToString();
        }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}