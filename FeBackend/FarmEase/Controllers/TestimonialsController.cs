using FECommon.DTO;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TestimonialsController : ControllerBase
    {
        private readonly ITestimonialService _testimonialService;

        public TestimonialsController(ITestimonialService testimonialService)
        {
            _testimonialService = testimonialService;
        }

        // GET: api/testimonials - Public endpoint for landing page
        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetActiveTestimonials()
        {
            try
            {
                var testimonials = await _testimonialService.GetActiveTestimonialsAsync();
                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // GET: api/testimonials/all - Admin endpoint for all testimonials
        [HttpGet("all")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetAllTestimonials()
        {
            try
            {
                var testimonials = await _testimonialService.GetAllTestimonialsAsync();
                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // GET: api/testimonials/pending - Admin endpoint for pending testimonials (low ratings)
        [HttpGet("pending")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetPendingTestimonials()
        {
            try
            {
                var testimonials = await _testimonialService.GetPendingTestimonialsAsync();
                return Ok(testimonials);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // GET: api/testimonials/{id}
        [HttpGet("{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> GetTestimonial(int id)
        {
            try
            {
                var testimonial = await _testimonialService.GetTestimonialByIdAsync(id);
                if (testimonial == null)
                    return NotFound(new { Message = "Testimonial not found." });
                return Ok(testimonial);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // POST: api/testimonials - Admin creates testimonial
        [HttpPost]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> CreateTestimonial([FromBody] CreateTestimonialDto request)
        {
            try
            {
                var testimonial = await _testimonialService.CreateTestimonialAsync(request);
                return Ok(new { Message = "Testimonial created successfully.", Testimonial = testimonial });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // POST: api/testimonials/submit - Public user submits a testimonial
        [HttpPost("submit")]
        [Authorize]
        public async Task<IActionResult> SubmitTestimonial([FromBody] SubmitTestimonialDto request)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                var testimonial = await _testimonialService.SubmitTestimonialAsync(request, userId);

                var message = testimonial.IsApproved
                    ? "Thank you for your review! It has been published."
                    : "Thank you for your review! It will be reviewed by our team before publishing.";

                return Ok(new { Message = message, Testimonial = testimonial });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // PUT: api/testimonials/{id}
        [HttpPut("{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> UpdateTestimonial(int id, [FromBody] UpdateTestimonialDto request)
        {
            try
            {
                var testimonial = await _testimonialService.UpdateTestimonialAsync(id, request);
                if (testimonial == null)
                    return NotFound(new { Message = "Testimonial not found." });
                return Ok(new { Message = "Testimonial updated successfully.", Testimonial = testimonial });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // DELETE: api/testimonials/{id}
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> DeleteTestimonial(int id)
        {
            try
            {
                var success = await _testimonialService.DeleteTestimonialAsync(id);
                if (!success)
                    return NotFound(new { Message = "Testimonial not found." });
                return Ok(new { Message = "Testimonial deleted successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // PATCH: api/testimonials/{id}/toggle-active
        [HttpPatch("{id}/toggle-active")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> ToggleTestimonialActive(int id)
        {
            try
            {
                var testimonial = await _testimonialService.ToggleTestimonialActiveAsync(id);
                if (testimonial == null)
                    return NotFound(new { Message = "Testimonial not found." });
                return Ok(new { Message = $"Testimonial {(testimonial.IsActive ? "activated" : "deactivated")} successfully.", Testimonial = testimonial });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }

        // PATCH: api/testimonials/{id}/approve - Admin approves pending testimonial
        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin,admin")]
        public async Task<IActionResult> ApproveTestimonial(int id)
        {
            try
            {
                var testimonial = await _testimonialService.ApproveTestimonialAsync(id);
                if (testimonial == null)
                    return NotFound(new { Message = "Testimonial not found." });
                return Ok(new { Message = "Testimonial approved successfully.", Testimonial = testimonial });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = ex.Message });
            }
        }
    }
}
