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
}
