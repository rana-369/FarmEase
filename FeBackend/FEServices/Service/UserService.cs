using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using FECommon.DTO;

namespace FEServices.Service
{
    public class UserService : IUserService
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IUnitOfWork _unitOfWork;

        public UserService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager, IUnitOfWork unitOfWork)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<UserProfileDto>> GetAllUsersAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            return users.Select(user => new UserProfileDto
            {
                Id = user.Id ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = user.Role ?? "farmer",
                IsSuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl,
                Location = user.Location,
                PhoneNumber = user.PhoneNumber,
                FarmSize = user.FarmSize,
                CompanyName = user.CompanyName
            });
        }

        public async Task<PagedResult<UserProfileDto>> GetAllUsersPagedAsync(int page, int limit, string? search, string? role)
        {
            var allUsers = await _unitOfWork.Users.GetAllAsync();
            
            // Apply filters
            var filteredUsers = allUsers.AsEnumerable();
            
            if (!string.IsNullOrEmpty(search))
            {
                filteredUsers = filteredUsers.Where(u => 
                    (u.FullName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (u.Email?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false));
            }
            
            if (!string.IsNullOrEmpty(role) && role.ToLower() != "all")
            {
                filteredUsers = filteredUsers.Where(u => 
                    u.Role?.Equals(role, StringComparison.OrdinalIgnoreCase) ?? false);
            }
            
            // Get total count after filtering
            var totalItems = filteredUsers.Count();
            
            // Apply pagination
            var pagedUsers = filteredUsers
                .OrderByDescending(u => u.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit);
            
            // Map to DTOs
            var userDtos = pagedUsers.Select(user => new UserProfileDto
            {
                Id = user.Id ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = user.Role ?? "farmer",
                IsSuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl,
                Location = user.Location,
                PhoneNumber = user.PhoneNumber,
                FarmSize = user.FarmSize,
                CompanyName = user.CompanyName
            }).ToList();
            
            return new PagedResult<UserProfileDto>(userDtos, totalItems, page, limit);
        }

        public async Task<UserProfileDto?> GetUserByIdAsync(string id)
        {
            var user = await _unitOfWork.Users.GetByIdAsync(id);
            if (user == null) return null;

            return new UserProfileDto
            {
                Id = user.Id ?? string.Empty,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                Role = user.Role ?? "farmer",
                IsSuspended = user.LockoutEnd.HasValue && user.LockoutEnd.Value > DateTimeOffset.UtcNow,
                CreatedAt = user.CreatedAt,
                ProfileImageUrl = user.ProfileImageUrl,
                Location = user.Location,
                PhoneNumber = user.PhoneNumber,
                FarmSize = user.FarmSize,
                CompanyName = user.CompanyName
            };
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

        public async Task<IEnumerable<object>> GetFarmersAsync()
        {
            var farmers = await _unitOfWork.Users.FindAsync(u => u.Role == "farmer");
            return farmers.Select(u => new { u.Id, u.FullName, u.Location, u.ProfileImageUrl });
        }

        public async Task<IEnumerable<object>> GetOwnersAsync()
        {
            var owners = await _unitOfWork.Users.FindAsync(u => u.Role == "owner");
            return owners.Select(u => new { u.Id, u.FullName, u.CompanyName, u.Location, u.ProfileImageUrl });
        }

        public async Task<(bool Success, string Message)> UpdateProfileAsync(string userId, UserProfileUpdateDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (false, "User not found.");

            user.FullName = model.FullName;
            user.PhoneNumber = model.PhoneNumber;
            user.Email = model.Email;
            user.UserName = model.Email;
            user.Location = model.Location;
            user.FarmSize = model.FarmSize;
            user.CompanyName = model.CompanyName;

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

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif" };
            var extension = Path.GetExtension(file.FileName).ToLower();
            if (!allowedExtensions.Contains(extension))
                return (false, "Only JPG, PNG, and GIF files are allowed.", null);

            var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "profiles");
            if (!Directory.Exists(folderPath))
                Directory.CreateDirectory(folderPath);

            var uniqueFileName = $"{Guid.NewGuid()}{extension}";
            var exactFilePath = Path.Combine(folderPath, uniqueFileName);

            using (var stream = new FileStream(exactFilePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var fileUrl = $"/uploads/profiles/{uniqueFileName}";
            user.ProfileImageUrl = fileUrl;

            await _userManager.UpdateAsync(user);

            return (true, "Profile image updated successfully!", fileUrl);
        }
    }
}
