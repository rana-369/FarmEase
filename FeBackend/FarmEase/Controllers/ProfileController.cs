using System.Security.Claims;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProfileController : ControllerBase
    {
        private readonly IUserService _userService;

        public ProfileController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProfile()
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var user = await _userService.GetUserByIdAsync(userId);
            if (user == null) return NotFound(new { Message = "User not found." });

            return Ok(user);
        }

        [HttpPut]
        public async Task<IActionResult> UpdateProfile([FromBody] UserProfileUpdateDto model)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var (success, message) = await _userService.UpdateProfileAsync(userId, model);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpPost("upload-image")]
        public async Task<IActionResult> UploadProfileImage(IFormFile file)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var (success, message, imageUrl) = await _userService.UploadProfileImageAsync(userId, file);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, ImageUrl = imageUrl });
        }
    }
}
