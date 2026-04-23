using System;
using System.ComponentModel.DataAnnotations;

namespace FEDTO.DTOs
{
    public class CreateReviewDto
    {
        [Required]
        public int BookingId { get; set; }

        [Required]
        [Range(1, 5, ErrorMessage = "Rating must be between 1 and 5")]
        public int Rating { get; set; }

        [MaxLength(500, ErrorMessage = "Comment cannot exceed 500 characters")]
        public string? Comment { get; set; }
    }

    public class ReviewResponseDto
    {
        public int Id { get; set; }
        public int BookingId { get; set; }
        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;
        public string FarmerId { get; set; } = string.Empty;
        public string FarmerName { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public int Rating { get; set; }
        public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class MachineRatingSummaryDto
    {
        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;
        public double AverageRating { get; set; }
        public int TotalReviews { get; set; }
        public int Rating1 { get; set; }
        public int Rating2 { get; set; }
        public int Rating3 { get; set; }
        public int Rating4 { get; set; }
        public int Rating5 { get; set; }
    }

    public class ReviewEligibilityDto
    {
        public int BookingId { get; set; }
        public int MachineId { get; set; }
        public string MachineName { get; set; } = string.Empty;
        public bool CanReview { get; set; }
        public string? Reason { get; set; }
        public bool HasReviewed { get; set; }
    }
}
