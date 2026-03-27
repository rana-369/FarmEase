using FEDTO.DTOs;

namespace FEServices.Interface
{
    public interface IPaymentService
    {
        Task<(bool Success, string Message, object? OrderData)> CreateOrderAsync(int bookingId);
        Task<(bool Success, string Message)> VerifyPaymentAsync(VerifyPaymentDto model);
        Task<(bool Success, string Message, object? RefundData)> RefundAsync(int bookingId, string? reason = null);
        Task<(bool Success, string Message)> SavePaymentAsync(int bookingId, string razorpayOrderId, string razorpayPaymentId, string razorpaySignature, decimal amount);
    }
}
