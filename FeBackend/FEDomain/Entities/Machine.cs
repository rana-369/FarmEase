using System;
using System.ComponentModel.DataAnnotations;

namespace FEDomain
{
    public class Machine
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public int Rate { get; set; }
        public string Status { get; set; } = "Pending Verification";
        public string ImageUrl { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}