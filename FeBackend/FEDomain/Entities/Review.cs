using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FEDomain
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [Required]
        public int MachineId { get; set; }

        [MaxLength(100)]
        public string? MachineName { get; set; }

        [Required]
        [MaxLength(450)]
        public string FarmerId { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FarmerName { get; set; }

        [Required]
        [MaxLength(450)]
        public string OwnerId { get; set; } = string.Empty;

        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(500)]
        public string? Comment { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
