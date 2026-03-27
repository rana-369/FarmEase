using FEDomain;
using Microsoft.AspNetCore.Http;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IMachineService
    {
        Task<IEnumerable<Machine>> GetAllMachinesAsync();
        Task<PagedResult<object>> GetAllMachinesPagedAsync(int page, int limit, string? search, string? status);
        Task<IEnumerable<Machine>> GetOwnerMachinesAsync(string ownerId);
        Task<IEnumerable<Machine>> GetActiveMachinesAsync();
        Task<IEnumerable<Machine>> GetPendingVerificationAsync();
        Task<Machine?> GetByIdAsync(int id);
        Task<(bool Success, string Message, Machine? Machine)> CreateAsync(Machine machine, string ownerId);
        Task<(bool Success, string Message)> ApproveAsync(int id);
        Task<(bool Success, string Message)> RejectAsync(int id, string? reason);
        Task<IEnumerable<object>> GetAvailableEquipmentAsync();
        Task<IEnumerable<string>> GetActiveCitiesAsync();
        Task<(bool Success, string Message)> AddEquipmentAsync(string name, string category, int pricePerHour, string ownerId, IFormFile? image, string? location = null, string? description = null);
    }
}
