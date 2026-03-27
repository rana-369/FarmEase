using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CompanyController : ControllerBase
    {
        [HttpGet("contact")]
        [AllowAnonymous]
        public IActionResult GetContactInfo()
        {
            return Ok(new
            {
                Email = "support@agriconnect.com",
                Phone = "+91 78766 23503",
                Address = "Sector 74, Mohali, Punjab, India",
                WorkingHours = "Mon - Sat: 9:00 AM - 6:00 PM"
            });
        }
    }
}
