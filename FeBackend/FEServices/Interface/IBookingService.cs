using FEDomain;
using FEDTO.DTOs;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IBookingService
    {
        Task<IEnumerable<Booking>> GetAllBookingsAsync();
        Task<PagedResult<object>> GetAllBookingsPagedAsync(int page, int limit, string? search, string? status);
        Task<IEnumerable<Booking>> GetOwnerBookingsAsync(string ownerId);
        Task<IEnumerable<object>> GetFarmerBookingsAsync(string farmerId);
        Task<Booking?> GetByIdAsync(int id);
        Task<(bool Success, string Message, Booking? Booking)> CreateAsync(CreateBookingDto request, string farmerId, string farmerName);
        Task<(bool Success, string Message)> AcceptAsync(int id, string ownerId);
        Task<(bool Success, string Message)> RejectAsync(int id, string ownerId);
        Task<(bool Success, string Message)> CompleteAsync(int id, string ownerId);
        Task<(bool Success, string Message)> CancelAsync(int id, string farmerId);
        Task<(bool Success, string Message)> PayAsync(int id, string farmerId);
        Task<object> GetOwnerDashboardStatsAsync(string ownerId);
        Task<object> GetFarmerStatsAsync(string farmerId);
        Task<object> GetAdminStatsAsync();
        Task<IEnumerable<object>> GetRevenueByMonthAsync();
    }
}
