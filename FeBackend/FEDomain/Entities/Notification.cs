using System;
using System.ComponentModel.DataAnnotations;

namespace FEDomain
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; } = string.Empty;

        public string Title { get; set; } = string.Empty;

        public string Message { get; set; } = string.Empty;

        public string Type { get; set; } = "info";

        public bool IsRead { get; set; } = false;

        public string ActionUrl { get; set; } = string.Empty;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}