using FEDomain;
using FEDTO.DTOs;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IBookingService
    {
        Task<IEnumerable<BookingSummaryDto>> GetAllBookingsAsync();
        Task<PagedResult<BookingSummaryDto>> GetAllBookingsPagedAsync(int page, int limit, string? search, string? status, CancellationToken cancellationToken = default);
        Task<IEnumerable<BookingSummaryDto>> GetOwnerBookingsAsync(string ownerId);
        Task<IEnumerable<BookingSummaryDto>> GetFarmerBookingsAsync(string farmerId);
        Task<Booking?> GetByIdAsync(int id);
        Task<(bool Success, string Message, Booking? Booking)> CreateAsync(CreateBookingDto request, string farmerId, string farmerName);
        Task<(bool Success, string Message)> AcceptAsync(int id, string ownerId);
        Task<(bool Success, string Message)> RejectAsync(int id, string ownerId);
        Task<(bool Success, string Message)> CompleteAsync(int id, string ownerId);
        Task<(bool Success, string Message)> CancelAsync(int id, string farmerId);
        Task<(bool Success, string Message)> PayAsync(int id, string farmerId);
        Task<OwnerDashboardStatsDto> GetOwnerDashboardStatsAsync(string ownerId);
        Task<FarmerDashboardStatsDto> GetFarmerStatsAsync(string farmerId);
        Task<AdminDashboardStatsDto> GetAdminStatsAsync(CancellationToken cancellationToken = default);
        Task<IEnumerable<MonthlyRevenueDto>> GetRevenueByMonthAsync();
        
        // Analytics methods
        Task<OwnerAnalyticsDto> GetOwnerAnalyticsAsync(string ownerId, string period = "month");
        Task<AdminAnalyticsDto> GetAdminAnalyticsAsync(string period = "month");
        Task<IEnumerable<UserGrowthDto>> GetUserGrowthAsync();
        Task<IEnumerable<BookingTrendDto>> GetBookingTrendsAsync();
        Task<IEnumerable<CategoryDistributionDto>> GetCategoryDistributionAsync();
        Task<IEnumerable<EquipmentPerformanceDto>> GetOwnerEquipmentPerformanceAsync(string ownerId);
    }
}
