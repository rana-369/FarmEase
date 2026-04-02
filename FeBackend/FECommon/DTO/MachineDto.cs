using System.ComponentModel.DataAnnotations;

namespace FEDTO.DTOs
{
    public class MachineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public string Status { get; set; } = string.Empty;
        public string ImageUrl { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
    }

    public class CreateMachineDto
    {
        [Required]
        [MaxLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; } = string.Empty;

        [Required]
        [MaxLength(50, ErrorMessage = "Type cannot exceed 50 characters")]
        public string Type { get; set; } = string.Empty;

        [Required]
        [Range(0.01, 1000000, ErrorMessage = "Rate must be between 0.01 and 1,000,000")]
        public decimal Rate { get; set; }

        [MaxLength(500, ErrorMessage = "ImageUrl cannot exceed 500 characters")]
        public string ImageUrl { get; set; } = string.Empty;
    }
}
