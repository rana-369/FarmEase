using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FEDomain
{
    public class Machine
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Rate { get; set; }
        
        public string Status { get; set; } = "Pending Verification";
        public string ImageUrl { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        
        [ForeignKey("OwnerId")]
        public virtual ApplicationUser Owner { get; set; } = null!;
        
        public string? Location { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}