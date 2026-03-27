using System;
using System.ComponentModel.DataAnnotations;

namespace FEDomain
{
    public class SystemSetting
    {
        [Key]
        public string Category { get; set; } = string.Empty;

        public string JsonData { get; set; } = string.Empty;

        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;
    }
}