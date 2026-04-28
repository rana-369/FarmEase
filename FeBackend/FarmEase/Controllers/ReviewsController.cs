using System.Security.Claims;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController(IReviewService reviewService) : ControllerBase
    {
        private readonly IReviewService _reviewService = reviewService;

        [HttpPost]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> CreateReview([FromBody] CreateReviewDto request)
        {
            try
            {
                var farmerId = GetUserId();
                if (farmerId == null)
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var farmerName = User.FindFirstValue("FullName") ?? "Farmer";

                var (success, message, review) = await _reviewService.CreateReviewAsync(request, farmerId, farmerName);
                if (!success)
                    return BadRequest(new { Message = message });

                return Ok(new { Message = message, Review = review });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("machine/{machineId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMachineReviews(int machineId, [FromQuery] int page = 1, [FromQuery] int limit = 10)
        {
            try
            {
                var result = await _reviewService.GetMachineReviewsPagedAsync(machineId, page, limit);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("machine/{machineId}/summary")]
        [AllowAnonymous]
        public async Task<IActionResult> GetMachineRatingSummary(int machineId)
        {
            try
            {
                var summary = await _reviewService.GetMachineRatingSummaryAsync(machineId);
                return Ok(summary);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("farmer")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> GetFarmerReviews()
        {
            try
            {
                var farmerId = GetUserId();
                if (farmerId == null)
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var reviews = await _reviewService.GetFarmerReviewsAsync(farmerId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("owner")]
        [Authorize(Roles = "Owner,owner")]
        public async Task<IActionResult> GetOwnerReviews()
        {
            try
            {
                var ownerId = GetUserId();
                if (ownerId == null)
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var reviews = await _reviewService.GetOwnerReviewsAsync(ownerId);
                return Ok(reviews);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("eligibility/{bookingId}")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> CheckReviewEligibility(int bookingId)
        {
            try
            {
                var farmerId = GetUserId();
                if (farmerId == null)
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var eligibility = await _reviewService.CheckReviewEligibilityAsync(bookingId, farmerId);
                return Ok(eligibility);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("booking/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> GetReviewByBookingId(int bookingId)
        {
            try
            {
                var review = await _reviewService.GetReviewByBookingIdAsync(bookingId);
                if (review == null)
                    return NotFound(new { Message = "Review not found for this booking." });
                return Ok(review);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        [HttpGet("eligible-bookings")]
        [Authorize(Roles = "Farmer,farmer")]
        public async Task<IActionResult> GetEligibleBookingsForReview()
        {
            try
            {
                var farmerId = GetUserId();
                if (farmerId == null)
                    return Unauthorized(new { Message = "Could not identify user from token." });

                var bookings = await _reviewService.GetEligibleBookingsForReviewAsync(farmerId);
                return Ok(bookings);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        private string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Name)
                ?? User.FindFirstValue("uid");
        }
    }
}
