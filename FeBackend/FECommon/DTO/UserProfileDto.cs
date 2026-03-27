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
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string? Location { get; set; }
        public string? FarmSize { get; set; }
        public string? CompanyName { get; set; }
    }

    public class UpdateRoleDto
    {
        public string NewRole { get; set; } = string.Empty;
    }
}
