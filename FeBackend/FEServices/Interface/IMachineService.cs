using FEDomain;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IMachineService
    {
        Task<IEnumerable<Machine>> GetAllMachinesAsync();
        Task<PagedResult<MachineSummaryDto>> GetAllMachinesPagedAsync(int page, int limit, string? search, string? status);
        Task<IEnumerable<Machine>> GetOwnerMachinesAsync(string ownerId);
        Task<IEnumerable<Machine>> GetActiveMachinesAsync();
        Task<IEnumerable<Machine>> GetPendingVerificationAsync();
        Task<Machine?> GetByIdAsync(int id);
        Task<(bool Success, string Message, Machine? Machine)> CreateAsync(Machine machine, string ownerId);
        Task<(bool Success, string Message)> ApproveAsync(int id);
        Task<(bool Success, string Message)> RejectAsync(int id, string? reason);
        Task<IEnumerable<MachineSummaryDto>> GetAvailableEquipmentAsync();
        Task<IEnumerable<string>> GetActiveCitiesAsync();
        Task<(bool Success, string Message)> AddEquipmentAsync(string name, string category, int pricePerHour, string ownerId, IFormFile? image, string? location = null, string? description = null, double? latitude = null, double? longitude = null, string? city = null, string? state = null, string? pincode = null);
        Task<(bool Success, string Message)> UpdateEquipmentAsync(int id, string? name, string? category, int? pricePerHour, IFormFile? image, string? location = null, string? description = null, double? latitude = null, double? longitude = null, string? city = null, string? state = null, string? pincode = null);
        Task<(bool Success, string Message)> DeleteEquipmentAsync(int id);

        // Equipment Calendar - Availability
        Task<IEnumerable<EquipmentAvailabilityDto>> GetEquipmentAvailabilityAsync(int machineId, DateTime startDate, DateTime endDate);

        // Location-based search
        Task<IEnumerable<NearbyMachineDto>> GetMachinesNearbyAsync(double latitude, double longitude, double radiusKm, string? category = null);
    }

    // DTO for equipment availability
    public class EquipmentAvailabilityDto
    {
        public DateTime Date { get; set; }
        public bool IsAvailable { get; set; }
        public List<BookingSlotDto> BookedSlots { get; set; } = [];
    }

    public class BookingSlotDto
    {
        public int BookingId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? FarmerName { get; set; }
        public int Hours { get; set; }
    }

    // DTO for nearby machines with distance
    public class NearbyMachineDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty;
        public decimal Rate { get; set; }
        public string? Location { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public string OwnerId { get; set; } = string.Empty;
        public string? OwnerName { get; set; }
        public double? Distance { get; set; } // Distance in kilometers
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? City { get; set; }
        public string? State { get; set; }
    }
}
