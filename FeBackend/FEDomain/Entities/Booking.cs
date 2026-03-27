using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FEDomain
{
    public class Booking
    {
        [Key]
        public int Id { get; set; }

        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;

        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;

        public string OwnerId { get; set; } = string.Empty;

        public int Hours { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BaseAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PlatformFee { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        public string Status { get; set; } = "Pending";

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}