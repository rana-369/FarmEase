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
        Task<(bool Success, string Message)> AddEquipmentAsync(string name, string category, int pricePerHour, string ownerId, IFormFile? image, string? location = null, string? description = null);

        // Equipment Calendar - Availability
        Task<IEnumerable<EquipmentAvailabilityDto>> GetEquipmentAvailabilityAsync(int machineId, DateTime startDate, DateTime endDate);
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
}
