namespace FEDomain
{
    public class Testimonial
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty; // "Farmer", "Owner", "User"
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; } = 5;
        public string? AuthorLocation { get; set; }
        public bool IsActive { get; set; } = true;
        public bool IsApproved { get; set; } = true; // Admin approval for low ratings
        public string? SubmittedByUserId { get; set; } // User who submitted (null if admin-created)
        public int DisplayOrder { get; set; } = 0;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UpdatedAt { get; set; }
    }
}
