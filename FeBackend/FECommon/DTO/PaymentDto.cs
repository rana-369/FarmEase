namespace FEDTO.DTOs
{
    public class CreateOrderDto
    {
        public int BookingId { get; set; }
    }

    public class VerifyPaymentDto
    {
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
        public int BookingId { get; set; }
    }

    public class PaymentResponseDto
    {
        public string OrderId { get; set; } = string.Empty;
        public string PaymentId { get; set; } = string.Empty;
        public int BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    // Owner Payment Settings DTOs for Razorpay Route API
    public class OwnerPaymentSettingsDto
    {
        public bool IsOnboardingComplete { get; set; }
        public DateTime? OnboardingCompletedAt { get; set; }
        public string? AccountStatus { get; set; } // active, pending, rejected
        public bool CanReceivePayments { get; set; }
    }

    public class OwnerOnboardingRequestDto
    {
        // These are sent to Razorpay to create linked account
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? CompanyName { get; set; }
    }

    public class OwnerOnboardingResponseDto
    {
        public bool Success { get; set; }
        public string? OnboardingUrl { get; set; } // URL to redirect owner for KYC
        public string? AccountId { get; set; } // Razorpay account ID
        public string? Message { get; set; }
    }

    public record SettlementStatusDto
    {
        public int PaymentId { get; set; }
        public decimal OwnerAmount { get; set; }
        public decimal PlatformFeeAmount { get; set; }
        public string SettlementStatus { get; set; } = string.Empty;
        public DateTime? SettledAt { get; set; }
        public string? TransferId { get; set; }
    }

    public class PlatformEarningsDto
    {
        public decimal TotalPlatformFees { get; set; }
        public decimal TotalSettled { get; set; }
        public decimal TotalPending { get; set; }
        public int TotalTransactions { get; set; }
        public List<SettlementStatusDto> RecentSettlements { get; set; } = new();
    }
}
