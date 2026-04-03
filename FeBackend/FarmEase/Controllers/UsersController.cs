using System.Security.Claims;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "admin,Admin")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpPut("{id}/suspend")]
        public async Task<IActionResult> ToggleUserSuspension(string id)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var (success, message, isSuspended) = await _userService.ToggleSuspensionAsync(id, currentUserId ?? "");
            
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message, IsSuspended = isSuspended });
        }

        [HttpPut("{id}/role")]
        public async Task<IActionResult> ChangeUserRole(string id, [FromBody] UpdateRoleDto model)
        {
            var (success, message) = await _userService.ChangeRoleAsync(id, model.NewRole);
            if (!success)
                return BadRequest(new { Message = message });

            return Ok(new { Message = message });
        }

        [HttpGet("farmers")]
        [Authorize] // Any authenticated user can view farmers
        public async Task<IActionResult> GetFarmers()
        {
            var farmers = await _userService.GetFarmersAsync();
            return Ok(farmers);
        }

        [HttpGet("owners")]
        [Authorize] // Any authenticated user can view owners
        public async Task<IActionResult> GetOwners()
        {
            var owners = await _userService.GetOwnersAsync();
            return Ok(owners);
        }
    }
}
