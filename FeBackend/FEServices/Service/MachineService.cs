using FEDomain;
using FEDomain.Interfaces;
using FEServices.Interface;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class MachineService : IMachineService
    {
        private readonly IUnitOfWork _unitOfWork;

        public MachineService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<IEnumerable<Machine>> GetAllMachinesAsync()
        {
            return await _unitOfWork.Machines.Query().AsNoTracking().ToListAsync();
        }

        public async Task<PagedResult<MachineSummaryDto>> GetAllMachinesPagedAsync(int page, int limit, string? search, string? status)
        {
            var query = _unitOfWork.Machines.Query().AsNoTracking();

            // Apply status filter at DB level
            if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(m => m.Status == status);
            }

            // Apply search filter at DB level BEFORE pagination
            if (!string.IsNullOrEmpty(search))
            {
                query = query.Where(m => 
                    (m.Name != null && m.Name.Contains(search)) ||
                    (m.Type != null && m.Type.Contains(search)) ||
                    (m.Location != null && m.Location.Contains(search)));
            }

            // Total count AFTER all filters
            var totalItems = await query.CountAsync();

            // Get paged machines
            var machines = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToListAsync();

            // Get owner data only for this page
            var ownerIds = machines.Select(m => m.OwnerId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var users = ownerIds.Count > 0
                ? await _unitOfWork.Users.Query().AsNoTracking().Where(u => ownerIds.Contains(u.Id)).ToListAsync()
                : [];

            // Map data to DTO
            var result = machines.Select(m =>
            {
                var owner = users.FirstOrDefault(u => u.Id == m.OwnerId);
                return new MachineSummaryDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Type = m.Type,
                    Rate = m.Rate,
                    Status = m.Status,
                    ImageUrl = m.ImageUrl,
                    CreatedAt = m.CreatedAt,
                    Location = m.Location ?? owner?.Location ?? "N/A",
                    Description = m.Description,
                    OwnerId = m.OwnerId,
                    OwnerName = owner?.FullName ?? "Unknown",
                    OwnerLocation = owner?.Location
                };
            }).ToList();

            return new PagedResult<MachineSummaryDto>(result, totalItems, page, limit);
        }

        public async Task<IEnumerable<Machine>> GetOwnerMachinesAsync(string ownerId)
        {
            return await _unitOfWork.Machines.GetByOwnerAsync(ownerId);
        }

        public async Task<IEnumerable<Machine>> GetActiveMachinesAsync()
        {
            return await _unitOfWork.Machines.GetActiveAsync();
        }

        public async Task<IEnumerable<Machine>> GetPendingVerificationAsync()
        {
            return await _unitOfWork.Machines.GetPendingAsync();
        }

        public async Task<Machine?> GetByIdAsync(int id)
        {
            return await _unitOfWork.Machines.GetByIdAsync(id);
        }

        public async Task<(bool Success, string Message, Machine? Machine)> CreateAsync(Machine machine, string ownerId)
        {
            machine.OwnerId = ownerId;
            machine.Status = "Pending Verification";
            machine.CreatedAt = DateTime.UtcNow;

            await _unitOfWork.Machines.AddAsync(machine);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Machine created successfully.", machine);
        }

        public async Task<(bool Success, string Message)> ApproveAsync(int id)
        {
            var machine = await _unitOfWork.Machines.GetByIdAsync(id);
            if (machine == null) return (false, "Machine not found.");

            machine.Status = "Verified";
            _unitOfWork.Machines.Update(machine);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Machine approved successfully.");
        }

        public async Task<(bool Success, string Message)> RejectAsync(int id, string? reason)
        {
            var machine = await _unitOfWork.Machines.GetByIdAsync(id);
            if (machine == null) return (false, "Machine not found.");

            machine.Status = "Rejected";
            _unitOfWork.Machines.Update(machine);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Machine rejected successfully.");
        }

        public async Task<IEnumerable<MachineSummaryDto>> GetAvailableEquipmentAsync()
        {
            var machines = await _unitOfWork.Machines.GetVerifiedAsync();
            var ownerIds = machines.Select(m => m.OwnerId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var users = ownerIds.Count > 0
                ? await _unitOfWork.Users.Query().Where(u => ownerIds.Contains(u.Id)).ToListAsync()
                : [];

            return machines.Select(m =>
            {
                var owner = users.FirstOrDefault(u => u.Id == m.OwnerId);
                return new MachineSummaryDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Type = m.Type,
                    Rate = m.Rate,
                    Status = m.Status,
                    ImageUrl = m.ImageUrl,
                    CreatedAt = m.CreatedAt,
                    Location = m.Location ?? owner?.Location ?? "N/A",
                    Description = m.Description,
                    OwnerId = m.OwnerId,
                    OwnerName = owner?.FullName ?? "Unknown",
                    OwnerLocation = owner?.Location
                };
            });
        }

        public async Task<IEnumerable<string>> GetActiveCitiesAsync()
        {
            var owners = await _unitOfWork.Users.GetOwnersAsync();
            var cities = owners.Select(u => u.Location).Where(l => !string.IsNullOrEmpty(l)).Cast<string>().Distinct().ToList();

            if (cities.Count == 0)
                cities = ["Mohali", "Chandigarh", "Panchkula", "Ludhiana"];

            return cities;
        }

        public async Task<(bool Success, string Message)> AddEquipmentAsync(string name, string category, int pricePerHour, string ownerId, IFormFile? image, string? location = null, string? description = null)
        {
            try
            {
                Console.WriteLine($"\n=== MachineService.AddEquipmentAsync ===");
                Console.WriteLine($"Name: {name}");
                Console.WriteLine($"Category: {category}");
                Console.WriteLine($"PricePerHour: {pricePerHour}");
                Console.WriteLine($"OwnerId: {ownerId}");
                Console.WriteLine($"Location: {location}");
                Console.WriteLine($"Description: {description}");
                
                string imageUrl = string.Empty;

                if (image != null && image.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "equipment");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                    var extension = Path.GetExtension(image.FileName).ToLower();
                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var exactFilePath = Path.Combine(folderPath, uniqueFileName);

                    using (var stream = new FileStream(exactFilePath, FileMode.Create))
                    {
                        await image.CopyToAsync(stream);
                    }
                    imageUrl = $"/uploads/equipment/{uniqueFileName}";
                    Console.WriteLine($"Image saved: {imageUrl}");
                }

                var newMachine = new Machine
                {
                    Name = name,
                    Type = category,
                    Rate = pricePerHour,
                    ImageUrl = imageUrl,
                    OwnerId = ownerId,
                    Location = location,
                    Description = description,
                    Status = "Active",
                    CreatedAt = DateTime.UtcNow
                };

                Console.WriteLine($"Creating machine: {newMachine.Name}, {newMachine.Type}, {newMachine.Rate}");
                
                await _unitOfWork.Machines.AddAsync(newMachine);
                var saveResult = await _unitOfWork.SaveChangesAsync();
                
                Console.WriteLine($"SaveChanges result: {saveResult}");
                Console.WriteLine($"Machine Id after save: {newMachine.Id}");
                Console.WriteLine($"==========================================\n");

                return (true, "Equipment added successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"\n!!! ERROR in AddEquipmentAsync: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"Inner Exception: {ex.InnerException.Message}");
                }
                Console.WriteLine("==========================================\n");
                return (false, $"Error: {ex.Message}");
            }
        }
    }
}
