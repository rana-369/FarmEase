using System.ComponentModel.DataAnnotations;

namespace FECommon.DTO
{
    public class TestimonialDto
    {
        public int Id { get; set; }
        public string AuthorName { get; set; } = string.Empty;
        public string AuthorRole { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? AuthorLocation { get; set; }
        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public bool IsUserSubmitted { get; set; }
        public int DisplayOrder { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class CreateTestimonialDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string AuthorRole { get; set; } = string.Empty;

        [Required]
        [StringLength(500, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [StringLength(100)]
        public string? AuthorLocation { get; set; }

        public bool IsActive { get; set; } = true;
        public int DisplayOrder { get; set; } = 0;
    }

    public class UpdateTestimonialDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string AuthorRole { get; set; } = string.Empty;

        [Required]
        [StringLength(500, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; }

        [StringLength(100)]
        public string? AuthorLocation { get; set; }

        public bool IsActive { get; set; }
        public bool IsApproved { get; set; }
        public int DisplayOrder { get; set; }
    }

    // For public user submissions
    public class SubmitTestimonialDto
    {
        [Required]
        [StringLength(100, MinimumLength = 2)]
        public string AuthorName { get; set; } = string.Empty;

        [Required]
        [StringLength(50)]
        public string AuthorRole { get; set; } = string.Empty; // Farmer, Owner

        [Required]
        [StringLength(500, MinimumLength = 10)]
        public string Content { get; set; } = string.Empty;

        [Range(1, 5)]
        public int Rating { get; set; } = 5;

        [StringLength(100)]
        public string? AuthorLocation { get; set; }
    }
}
