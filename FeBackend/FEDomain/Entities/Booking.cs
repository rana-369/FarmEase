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
        
        [ForeignKey("MachineId")]
        public virtual Machine Machine { get; set; } = null!;

        public string FarmerId { get; set; } = string.Empty;
        
        [ForeignKey("FarmerId")]
        public virtual ApplicationUser Farmer { get; set; } = null!;

        public string OwnerId { get; set; } = string.Empty;
        
        [ForeignKey("OwnerId")]
        public virtual ApplicationUser Owner { get; set; } = null!;

        public int Hours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PlatformFee { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        // Use enum for type safety, stored as string in database
        public BookingStatus Status { get; set; } = BookingStatus.Pending;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}