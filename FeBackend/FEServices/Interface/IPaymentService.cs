using FEDTO.DTOs;

namespace FEServices.Interface
{
    public interface IPaymentService
    {
        // Existing payment methods
        Task<(bool Success, string Message, object? OrderData)> CreateOrderAsync(int bookingId);
        Task<(bool Success, string Message)> VerifyPaymentAsync(VerifyPaymentDto model);
        Task<(bool Success, string Message, object? RefundData)> RefundAsync(int bookingId, string? reason = null);
        Task<(bool Success, string Message)> SavePaymentAsync(int bookingId, string razorpayOrderId, string razorpayPaymentId, string razorpaySignature, decimal amount);

        // Razorpay Route API - Owner Payment Settlements
        Task<(bool Success, string Message, OwnerOnboardingResponseDto? Data)> InitiateOwnerOnboardingAsync(string userId);
        Task<(bool Success, string Message)> CompleteOwnerOnboardingAsync(string userId, string accountId);
        Task<OwnerPaymentSettingsDto> GetOwnerPaymentSettingsAsync(string userId);
        Task<PlatformEarningsDto> GetPlatformEarningsAsync();
        Task<(bool Success, string Message)> ProcessSettlementAsync(int paymentId);

        // Webhook handlers
        Task<int?> GetOrderByRazorpayOrderIdAsync(string razorpayOrderId);
        Task<(bool Success, string Message)> UpdatePaymentStatusAsync(int paymentId, string status, string? razorpayPaymentId = null, string? failureReason = null);
        Task<(bool Success, string Message)> UpdateRefundStatusAsync(int paymentId, string status, string? razorpayRefundId = null);
        Task<(bool Success, string Message)> UpdateSettlementStatusAsync(string razorpayTransferId, string status, DateTime? settledAt = null, string? failureReason = null);
    }
}
