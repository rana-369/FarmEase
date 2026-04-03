using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FEDomain
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        public int BookingId { get; set; }

        public string RazorpayOrderId { get; set; } = string.Empty;

        public string RazorpayPaymentId { get; set; } = string.Empty;

        public string RazorpaySignature { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        public string Currency { get; set; } = "INR";

        public string Status { get; set; } = "Pending"; // Pending, Captured, Refunded, Failed

        [Column(TypeName = "decimal(18,2)")]
        public decimal? RefundAmount { get; set; }

        public string? RefundId { get; set; } // Razorpay refund ID

        public DateTime? RefundedAt { get; set; }

        public string? RefundReason { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
