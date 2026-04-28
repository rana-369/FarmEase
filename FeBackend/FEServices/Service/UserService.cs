using AutoMapper;
using AutoMapper.QueryableExtensions;
using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using FECommon.DTO;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class UserService(
        UserManager<ApplicationUser> userManager,
        RoleManager<IdentityRole> roleManager,
        IUnitOfWork unitOfWork,
        IMapper mapper) : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager = userManager;
        private readonly RoleManager<IdentityRole> _roleManager = roleManager;
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;

        public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync()
        {
            // Using AutoMapper ProjectTo for efficient EF projection
            var users = await _unitOfWork.Users.Query()
                .ProjectTo<UserProfileDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return users;
        }

        public async Task<PagedResult<UserProfileDto>> GetAllUsersPagedAsync(int page, int limit, string? search, string? role)
        {
            var query = _unitOfWork.Users.Query();

            // Apply role filter at DB level
            if (!string.IsNullOrEmpty(role) && !role.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(u => u.Role == role);
            }

            // Apply search filter at DB level
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(u =>
                    (u.FullName != null && u.FullName.Contains(search)) ||
                    (u.Email != null && u.Email.Contains(search)));
            }

            // Total count
            var totalItems = await query.CountAsync();

            // Get paged users using AutoMapper ProjectTo
            var users = await query
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ProjectTo<UserProfileDto>(_mapper.ConfigurationProvider)
                .ToListAsync();

            return new PagedResult<UserProfileDto>(users, totalItems, page, limit);
        }

        public async Task<UserProfileDto?> GetUserByIdAsync(string id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return null;

            // Using AutoMapper for single entity mapping
            return _mapper.Map<UserProfileDto>(user);
        }

        public async Task<(bool Success, string Message, bool IsSuspended)> ToggleSuspensionAsync(string id, string currentUserId)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return (false, "User not found.", false);

            if (user.Id == currentUserId) return (false, "You cannot suspend your own admin account.", false);

            bool isCurrentlySuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow;

            if (isCurrentlySuspended)
            {
                await _userManager.SetLockoutEndDateAsync(user, null);
                return (true, "User access restored.", false);
            }
            else
            {
                await _userManager.SetLockoutEndDateAsync(user, DateTimeOffset.UtcNow.AddYears(100));
                await _userManager.UpdateSecurityStampAsync(user);
                return (true, "User account suspended.", true);
            }
        }

        public async Task<(bool Success, string Message)> ChangeRoleAsync(string id, string newRole)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return (false, "User not found.");

            string role = newRole.ToLower();

            user.Role = role;
            await _userManager.UpdateAsync(user);

            if (await _roleManager.RoleExistsAsync(role))
            {
                var currentRoles = await _userManager.GetRolesAsync(user);
                await _userManager.RemoveFromRolesAsync(user, currentRoles);
                await _userManager.AddToRoleAsync(user, role);
            }

            return (true, $"User role successfully updated to {role}.");
        }

        public async Task<(bool Success, string Message)> DeleteUserAsync(string id, string currentUserId)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null) return (false, "User not found.");

            if (user.Id == currentUserId) return (false, "You cannot delete your own admin account.");

            // Delete user's machines if they are an owner
            if (string.Equals(user.Role, "owner", StringComparison.OrdinalIgnoreCase))
            {
                var machines = await _unitOfWork.Machines.Query()
                    .Where(m => m.OwnerId == id)
                    .ToListAsync();
                foreach (var machine in machines)
                {
                    _unitOfWork.Machines.Delete(machine);
                }
            }

            // Delete user's bookings
            var bookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.FarmerId == id || b.OwnerId == id)
                .ToListAsync();
            foreach (var booking in bookings)
            {
                _unitOfWork.Bookings.Delete(booking);
            }

            // Delete user's notifications
            var notifications = await _unitOfWork.Notifications.Query()
                .Where(n => n.UserId == id)
                .ToListAsync();
            foreach (var notification in notifications)
            {
                _unitOfWork.Notifications.Delete(notification);
            }

            await _unitOfWork.SaveChangesAsync();

            // Delete the user
            var result = await _userManager.DeleteAsync(user);
            if (!result.Succeeded)
                return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

            return (true, "User deleted successfully.");
        }

        public async Task<IEnumerable<FarmerSummaryDto>> GetFarmersAsync()
        {
            var farmers = await _unitOfWork.Users.GetFarmersAsync();
            // Using AutoMapper for collection mapping
            return _mapper.Map<IEnumerable<FarmerSummaryDto>>(farmers);
        }

        public async Task<IEnumerable<OwnerSummaryDto>> GetOwnersAsync()
        {
            var owners = await _unitOfWork.Users.GetOwnersAsync();
            var ownerIds = owners.Select(o => o.Id).ToList();
            var machineCounts = await _unitOfWork.Machines.Query()
                .Where(m => ownerIds.Contains(m.OwnerId))
                .GroupBy(m => m.OwnerId)
                .Select(g => new { OwnerId = g.Key, Count = g.Count() })
                .ToDictionaryAsync(x => x.OwnerId, x => x.Count);

            // Using AutoMapper with AfterMap for MachineCount calculation
            var ownerDtos = _mapper.Map<List<OwnerSummaryDto>>(owners);
            
            // Set MachineCount for each owner
            for (int i = 0; i < owners.Count(); i++)
            {
                var owner = owners.ElementAt(i);
                ownerDtos[i] = ownerDtos[i] with 
                { 
                    MachineCount = machineCounts.TryGetValue(owner.Id ?? "", out var count) ? count : 0 
                };
            }
            
            return ownerDtos;
        }

        public async Task<(bool Success, string Message)> UpdateProfileAsync(string userId, UserProfileUpdateDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (false, "User not found.");

            // Using AutoMapper to map DTO to entity
            _mapper.Map(model, user);

            var result = await _userManager.UpdateAsync(user);

            if (result.Succeeded)
                return (true, "Profile updated successfully!");

            return (false, string.Join(", ", result.Errors.Select(e => e.Description)));
        }

        public async Task<(bool Success, string Message, string? ImageUrl)> UploadProfileImageAsync(string userId, IFormFile file)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (false, "User not found.", null);

            if (file == null || file.Length == 0)
                return (false, "No file was uploaded.", null);

            string[] allowedExtensions = [".jpg", ".jpeg", ".png", ".gif"];
            var extension = Path.GetExtension(file.FileName);
            if (!allowedExtensions.Contains(extension, StringComparer.OrdinalIgnoreCase))
                return (false, "Only JPG, PNG, and GIF files are allowed.", null);

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var exactFilePath = Path.Combine(folderPath, uniqueFileName);

            using var stream = new FileStream(exactFilePath, FileMode.Create);
            await file.CopyToAsync(stream);

            var fileUrl = $"/uploads/profiles/{uniqueFileName}";
            user.ProfileImageUrl = fileUrl;

            await _userManager.UpdateAsync(user);

            return (true, "Profile image updated successfully!", fileUrl);
        }
    }
}
