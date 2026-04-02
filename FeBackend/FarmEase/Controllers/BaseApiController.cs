using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace FarmEase.Controllers
{
    /// <summary>
    /// Base controller with common functionality for all API controllers
    /// </summary>
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        /// <summary>
        /// Gets the current authenticated user's ID from claims
        /// </summary>
        /// <returns>User ID string or null if not authenticated</returns>
        protected string? GetUserId()
        {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirstValue(ClaimTypes.Name)
                ?? User.FindFirstValue("uid");
        }

        /// <summary>
        /// Gets the current authenticated user's ID or returns Unauthorized result
        /// </summary>
        /// <param name="userId">Output user ID if authenticated</param>
        /// <returns>True if user is authenticated, false with Unauthorized result otherwise</returns>
        protected bool TryGetUserId(out string userId)
        {
            var id = GetUserId();
            if (string.IsNullOrEmpty(id))
            {
                userId = string.Empty;
                return false;
            }
            userId = id;
            return true;
        }

        /// <summary>
        /// Gets the user ID and returns Unauthorized if not authenticated
        /// </summary>
        /// <returns>Tuple with success flag and user ID</returns>
        protected (bool Success, string? UserId) GetUserIdOrUnauthorized()
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return (false, null);
            }
            return (true, userId);
        }
    }
}
