using FEDomain;
using FEDTO.DTOs;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IUserService
    {
        Task<IEnumerable<UserProfileDto>> GetAllUsersAsync();
        Task<PagedResult<UserProfileDto>> GetAllUsersPagedAsync(int page, int limit, string? search, string? role);
        Task<UserProfileDto?> GetUserByIdAsync(string id);
        Task<(bool Success, string Message, bool IsSuspended)> ToggleSuspensionAsync(string id, string currentUserId);
        Task<(bool Success, string Message)> ChangeRoleAsync(string id, string newRole);
        Task<(bool Success, string Message)> DeleteUserAsync(string id, string currentUserId);
        Task<IEnumerable<FarmerSummaryDto>> GetFarmersAsync();
        Task<IEnumerable<OwnerSummaryDto>> GetOwnersAsync();
        Task<(bool Success, string Message)> UpdateProfileAsync(string userId, UserProfileUpdateDto model);
        Task<(bool Success, string Message, string? ImageUrl)> UploadProfileImageAsync(string userId, IFormFile file);
    }
}
