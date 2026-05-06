using AutoMapper;
using AutoMapper.QueryableExtensions;
using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEServices.Interface;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;
using FECommon.Security;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class MachineService(IUnitOfWork unitOfWork, IMapper mapper) : IMachineService
    {
        private readonly IUnitOfWork _unitOfWork = unitOfWork;
        private readonly IMapper _mapper = mapper;

        public async Task<IEnumerable<Machine>> GetAllMachinesAsync()
        {
            return await _unitOfWork.Machines.Query().AsNoTracking().ToListAsync();
        }

        public async Task<PagedResult<MachineSummaryDto>> GetAllMachinesPagedAsync(int page, int limit, string? search, string? status)
        {
            var (_, validPage, validLimit) = InputSanitizer.ValidatePagination(page, limit);
            var sanitizedSearch = InputSanitizer.SanitizeSearchInput(search);
            
            var query = _unitOfWork.Machines.Query().AsNoTracking();

            if (!string.IsNullOrEmpty(status) && !string.Equals(status, "all", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(m => m.Status == status);
            }

            if (!string.IsNullOrEmpty(sanitizedSearch))
            {
                query = query.Where(m => 
                    (m.Name != null && m.Name.Contains(sanitizedSearch)) ||
                    (m.Type != null && m.Type.Contains(sanitizedSearch)) ||
                    (m.Location != null && m.Location.Contains(sanitizedSearch)));
            }

            var totalItems = await query.CountAsync();

            var machines = await query
                .OrderByDescending(m => m.CreatedAt)
                .Skip((validPage - 1) * validLimit)
                .Take(validLimit)
                .ToListAsync();

            var ownerIds = machines.Select(m => m.OwnerId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var users = ownerIds.Count > 0
                ? await _unitOfWork.Users.Query().AsNoTracking().Where(u => ownerIds.Contains(u.Id)).ToListAsync()
                : [];

            var result = _mapper.Map<List<MachineSummaryDto>>(machines);
            
            for (int i = 0; i < machines.Count; i++)
            {
                var owner = users.FirstOrDefault(u => u.Id == machines[i].OwnerId);
                result[i] = result[i] with
                {
                    Location = machines[i].Location ?? owner?.Location ?? "N/A",
                    OwnerName = owner?.FullName ?? "Unknown",
                    OwnerLocation = owner?.Location
                };
            }

            return new PagedResult<MachineSummaryDto>(result, totalItems, validPage, validLimit);
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
            List<ApplicationUser> users = ownerIds.Count > 0
                ? await _unitOfWork.Users.Query().Where(u => ownerIds.Contains(u.Id)).ToListAsync()
                : [];

            // Map using AutoMapper for base properties, then enrich with owner data
            var result = _mapper.Map<List<MachineSummaryDto>>(machines);
            
            for (int i = 0; i < machines.Count(); i++)
            {
                var owner = users.FirstOrDefault(u => u.Id == machines.ElementAt(i).OwnerId);
                result[i] = result[i] with
                {
                    Location = machines.ElementAt(i).Location ?? owner?.Location ?? "N/A",
                    OwnerName = owner?.FullName ?? "Unknown",
                    OwnerLocation = owner?.Location
                };
            }
            
            return result;
        }

        public async Task<IEnumerable<string>> GetActiveCitiesAsync()
        {
            var owners = await _unitOfWork.Users.GetOwnersAsync();
            var cities = owners.Select(u => u.Location).Where(l => !string.IsNullOrEmpty(l)).Cast<string>().Distinct().ToList();

            return cities;
        }

        public async Task<(bool Success, string Message)> AddEquipmentAsync(string name, string category, int pricePerHour, string ownerId, IFormFile? image, string? location = null, string? description = null, double? latitude = null, double? longitude = null, string? city = null, string? state = null, string? pincode = null)
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
                Console.WriteLine($"Latitude: {latitude}");
                Console.WriteLine($"Longitude: {longitude}");
                Console.WriteLine($"City: {city}");
                Console.WriteLine($"State: {state}");
                
                string imageUrl = string.Empty;

                if (image != null && image.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "equipment");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                    var extension = Path.GetExtension(image.FileName).ToLower();
                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var exactFilePath = Path.Combine(folderPath, uniqueFileName);

                    using var stream = new FileStream(exactFilePath, FileMode.Create);
                    await image.CopyToAsync(stream);
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
                    CreatedAt = DateTime.UtcNow,
                    // Location-based search fields
                    Latitude = latitude,
                    Longitude = longitude,
                    City = city,
                    State = state,
                    Pincode = pincode
                };

                Console.WriteLine($"Creating machine: {newMachine.Name}, {newMachine.Type}, {newMachine.Rate}");
                
                await _unitOfWork.Machines.AddAsync(newMachine);
                await _unitOfWork.SaveChangesAsync();
                
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

        public async Task<(bool Success, string Message)> UpdateEquipmentAsync(int id, string? name, string? category, int? pricePerHour, IFormFile? image, string? location = null, string? description = null, double? latitude = null, double? longitude = null, string? city = null, string? state = null, string? pincode = null)
        {
            try
            {
                var machine = await _unitOfWork.Machines.GetByIdAsync(id);
                if (machine == null)
                {
                    return (false, "Equipment not found.");
                }

                if (!string.IsNullOrWhiteSpace(name))
                    machine.Name = name;
                
                if (!string.IsNullOrWhiteSpace(category))
                    machine.Type = category;
                
                if (pricePerHour.HasValue)
                    machine.Rate = pricePerHour.Value;
                
                if (location != null)
                    machine.Location = location;
                
                if (description != null)
                    machine.Description = description;
                
                if (latitude.HasValue)
                    machine.Latitude = latitude;
                
                if (longitude.HasValue)
                    machine.Longitude = longitude;
                
                if (city != null)
                    machine.City = city;
                
                if (state != null)
                    machine.State = state;
                
                if (pincode != null)
                    machine.Pincode = pincode;

                // Handle image upload - delete old image and save new one
                if (image != null && image.Length > 0)
                {
                    var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "equipment");
                    if (!Directory.Exists(folderPath)) Directory.CreateDirectory(folderPath);

                    if (!string.IsNullOrEmpty(machine.ImageUrl))
                    {
                        var oldImagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", machine.ImageUrl.TrimStart('/'));
                        if (File.Exists(oldImagePath))
                        {
                            File.Delete(oldImagePath);
                        }
                    }

                    var extension = Path.GetExtension(image.FileName).ToLower();
                    var uniqueFileName = $"{Guid.NewGuid()}{extension}";
                    var exactFilePath = Path.Combine(folderPath, uniqueFileName);

                    using var stream = new FileStream(exactFilePath, FileMode.Create);
                    await image.CopyToAsync(stream);
                    machine.ImageUrl = $"/uploads/equipment/{uniqueFileName}";
                }

                _unitOfWork.Machines.Update(machine);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Equipment updated successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in UpdateEquipmentAsync: {ex.Message}");
                return (false, $"Error: {ex.Message}");
            }
        }

        public async Task<(bool Success, string Message)> DeleteEquipmentAsync(int id)
        {
            try
            {
                var machine = await _unitOfWork.Machines.GetByIdAsync(id);
                if (machine == null)
                {
                    return (false, "Equipment not found.");
                }

                // Delete image file
                if (!string.IsNullOrEmpty(machine.ImageUrl))
                {
                    var imagePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", machine.ImageUrl.TrimStart('/'));
                    if (File.Exists(imagePath))
                    {
                        File.Delete(imagePath);
                    }
                }

                // Delete related bookings first to maintain referential integrity
                var bookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.MachineId == id)
                    .ToListAsync();
                
                foreach (var booking in bookings)
                {
                    _unitOfWork.Bookings.Delete(booking);
                }

                _unitOfWork.Machines.Delete(machine);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Equipment deleted successfully!");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in DeleteEquipmentAsync: {ex.Message}");
                return (false, $"Error: {ex.Message}");
            }
        }

        public async Task<IEnumerable<EquipmentAvailabilityDto>> GetEquipmentAvailabilityAsync(int machineId, DateTime startDate, DateTime endDate)
        {
            var machine = await _unitOfWork.Machines.GetByIdAsync(machineId);
            if (machine == null)
                return [];

            var bookings = await _unitOfWork.Bookings.Query()
                .Where(b => b.MachineId == machineId &&
                           b.Status != "Rejected" && b.Status != "Cancelled")
                .ToListAsync();

            var availabilityList = new List<EquipmentAvailabilityDto>();
            var currentDate = startDate.Date;

            while (currentDate <= endDate.Date)
            {
                // For now, bookings don't have specific dates, so we'll mark days as available
                // In a real system, you'd check if there are bookings for this specific date

                var dayAvailability = new EquipmentAvailabilityDto
                {
                    Date = currentDate,
                    IsAvailable = true, // Default to available
                    BookedSlots = []
                };

                // If you had StartDate/EndDate on bookings, you'd check like:
                // var dayBookings = bookings.Where(b => b.StartDate?.Date == currentDate).ToList();
                // dayAvailability.IsAvailable = dayBookings.Count == 0;
                // dayAvailability.BookedSlots = dayBookings.Select(b => new BookingSlotDto {...}).ToList();

                availabilityList.Add(dayAvailability);
                currentDate = currentDate.AddDays(1);
            }

            return availabilityList;
        }

        /// <summary>
        /// Get machines near a specific location using Haversine formula
        /// </summary>
        public async Task<IEnumerable<NearbyMachineDto>> GetMachinesNearbyAsync(double latitude, double longitude, double radiusKm, string? category = null)
        {
            // Get all verified/active machines with coordinates
            var query = _unitOfWork.Machines.Query()
                .AsNoTracking()
                .Where(m => (m.Status == "Verified" || m.Status == "Active") && 
                           m.Latitude.HasValue && m.Longitude.HasValue);

            // Apply category filter if specified
            if (!string.IsNullOrEmpty(category) && !string.Equals(category, "All", StringComparison.OrdinalIgnoreCase))
            {
                query = query.Where(m => m.Type == category);
            }

            var machines = await query.ToListAsync();

            // Get owner data for all machines
            var ownerIds = machines.Select(m => m.OwnerId).Where(id => !string.IsNullOrEmpty(id)).Distinct().ToList();
            var users = ownerIds.Count > 0
                ? await _unitOfWork.Users.Query().AsNoTracking().Where(u => ownerIds.Contains(u.Id)).ToListAsync()
                : [];

            // Calculate distance and filter by radius using Haversine formula
            var nearbyMachines = machines
                .Select(m =>
                {
                    var distance = CalculateHaversineDistance(latitude, longitude, m.Latitude!.Value, m.Longitude!.Value);
                    var owner = users.FirstOrDefault(u => u.Id == m.OwnerId);
                    return new NearbyMachineDto
                    {
                        Id = m.Id,
                        Name = m.Name,
                        Type = m.Type,
                        Rate = m.Rate,
                        Location = m.Location ?? owner?.Location ?? "N/A",
                        Description = m.Description,
                        ImageUrl = m.ImageUrl,
                        Status = m.Status,
                        OwnerId = m.OwnerId,
                        OwnerName = owner?.FullName ?? "Unknown",
                        Distance = distance,
                        Latitude = m.Latitude,
                        Longitude = m.Longitude,
                        City = m.City,
                        State = m.State
                    };
                })
                .Where(m => m.Distance <= radiusKm)
                .OrderBy(m => m.Distance)
                .ToList();

            return nearbyMachines;
        }

        /// <summary>
        /// Calculate distance between two coordinates using Haversine formula
        /// Returns distance in kilometers
        /// </summary>
        private static double CalculateHaversineDistance(double lat1, double lon1, double lat2, double lon2)
        {
            const double R = 6371; // Earth's radius in kilometers

            var dLat = ToRadians(lat2 - lat1);
            var dLon = ToRadians(lon2 - lon1);

            var a = Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                    Math.Cos(ToRadians(lat1)) * Math.Cos(ToRadians(lat2)) *
                    Math.Sin(dLon / 2) * Math.Sin(dLon / 2);

            var c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));

            return R * c;
        }

        private static double ToRadians(double degrees)
        {
            return degrees * Math.PI / 180;
        }
    }
}
