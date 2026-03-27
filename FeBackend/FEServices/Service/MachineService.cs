using FEDomain;
using FEDomain.Interfaces;
using FEServices.Interface;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;

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
            return await _unitOfWork.Machines.GetAllAsync();
        }

        public async Task<PagedResult<object>> GetAllMachinesPagedAsync(int page, int limit, string? search, string? status)
        {
            var allMachines = await _unitOfWork.Machines.GetAllAsync();
            var allUsers = await _unitOfWork.Users.GetAllAsync();
            
            // Join machines with owners
            var machinesWithOwners = allMachines.Select(m =>
            {
                var owner = allUsers.FirstOrDefault(u => string.Equals(u.Id, m.OwnerId, StringComparison.OrdinalIgnoreCase));
                return new
                {
                    m.Id,
                    m.Name,
                    m.Type,
                    m.Rate,
                    m.Status,
                    m.ImageUrl,
                    m.CreatedAt,
                    m.Location,
                    m.Description,
                    OwnerName = owner?.FullName ?? "Unknown",
                    OwnerLocation = owner?.Location ?? "",
                    m.OwnerId
                };
            }).AsEnumerable();
            
            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                machinesWithOwners = machinesWithOwners.Where(m => 
                    (m.Name?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (m.OwnerName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (m.OwnerLocation?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (m.Type?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false));
            }
            
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                machinesWithOwners = machinesWithOwners.Where(m => 
                    m.Status?.Equals(status, StringComparison.OrdinalIgnoreCase) ?? false);
            }
            
            // Get total count after filtering
            var totalItems = machinesWithOwners.Count();
            
            // Apply pagination
            var pagedMachines = machinesWithOwners
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();
            
            return new PagedResult<object>(pagedMachines.Cast<object>().ToList(), totalItems, page, limit);
        }

        public async Task<IEnumerable<Machine>> GetOwnerMachinesAsync(string ownerId)
        {
            var allMachines = await _unitOfWork.Machines.GetAllAsync();
            return allMachines
                .Where(m => string.Equals(m.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(m => m.CreatedAt);
        }

        public async Task<IEnumerable<Machine>> GetActiveMachinesAsync()
        {
            return await _unitOfWork.Machines.FindAsync(m => m.Status == "Active" || m.Status == "Verified");
        }

        public async Task<IEnumerable<Machine>> GetPendingVerificationAsync()
        {
            return await _unitOfWork.Machines.FindAsync(m => m.Status == "Pending Verification" || m.Status == "Pending");
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

        public async Task<IEnumerable<object>> GetAvailableEquipmentAsync()
        {
            var machines = await _unitOfWork.Machines.GetAllAsync();
            var users = await _unitOfWork.Users.GetAllAsync();

            return machines
                .Where(m => m.Status == "Active" || m.Status == "Verified")
                .Join(users,
                    m => m.OwnerId,
                    u => u.Id,
                    (m, u) => new
                    {
                        Id = m.Id,
                        Name = m.Name,
                        Category = m.Type,
                        PricePerHour = m.Rate,
                        Location = u.Location ?? "N/A",
                        ImageUrl = m.ImageUrl,
                        OwnerName = u.FullName
                    });
        }

        public async Task<IEnumerable<string>> GetActiveCitiesAsync()
        {
            var users = await _unitOfWork.Users.FindAsync(u => u.Role == "owner" && !string.IsNullOrEmpty(u.Location));
            var cities = users.Select(u => u.Location).Where(l => l != null).Cast<string>().Distinct().ToList();

            if (!cities.Any())
                cities = new List<string> { "Mohali", "Chandigarh", "Panchkula", "Ludhiana" };

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
