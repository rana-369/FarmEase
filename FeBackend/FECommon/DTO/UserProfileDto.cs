using System.ComponentModel.DataAnnotations;

namespace FEDTO.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsSuspended { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? ProfileImageUrl { get; set; }
        public string? Location { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FarmSize { get; set; }
        public string? CompanyName { get; set; }
    }

    public class UserProfileUpdateDto
    {
        [Required]
        [MaxLength(100, ErrorMessage = "Full name cannot exceed 100 characters")]
        public string FullName { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Phone]
        [MaxLength(20, ErrorMessage = "Phone number cannot exceed 20 characters")]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(100, ErrorMessage = "Location cannot exceed 100 characters")]
        public string? Location { get; set; }

        [MaxLength(50, ErrorMessage = "Farm size cannot exceed 50 characters")]
        public string? FarmSize { get; set; }

        [MaxLength(100, ErrorMessage = "Company name cannot exceed 100 characters")]
        public string? CompanyName { get; set; }
    }

    public class UpdateRoleDto
    {
        [Required]
        public string NewRole { get; set; } = string.Empty;
    }
}
