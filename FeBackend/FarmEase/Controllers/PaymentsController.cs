using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create-order")]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto model)
        {
            var (success, message, orderData) = await _paymentService.CreateOrderAsync(model.BookingId);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(orderData);
        }

        [HttpPost("verify-payment")]
        public async Task<IActionResult> VerifyPayment([FromBody] VerifyPaymentDto model)
        {
            var (success, message) = await _paymentService.VerifyPaymentAsync(model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("refund/{bookingId}")]
        public async Task<IActionResult> Refund(int bookingId, [FromQuery] string? reason = null)
        {
            var (success, message, refundData) = await _paymentService.RefundAsync(bookingId, reason);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, RefundData = refundData });
        }
    }
}
