using FEDTO.DTOs;
using FECommon.DTO;

namespace FEServices.Interface
{
    public interface IReviewService
    {
        Task<(bool Success, string Message, ReviewResponseDto? Review)> CreateReviewAsync(CreateReviewDto request, string farmerId, string farmerName);
        Task<IEnumerable<ReviewResponseDto>> GetMachineReviewsAsync(int machineId);
        Task<MachineRatingSummaryDto> GetMachineRatingSummaryAsync(int machineId);
        Task<IEnumerable<ReviewResponseDto>> GetFarmerReviewsAsync(string farmerId);
        Task<IEnumerable<ReviewResponseDto>> GetOwnerReviewsAsync(string ownerId);
        Task<ReviewEligibilityDto> CheckReviewEligibilityAsync(int bookingId, string farmerId);
        Task<ReviewResponseDto?> GetReviewByBookingIdAsync(int bookingId);
        Task<IEnumerable<ReviewEligibilityDto>> GetEligibleBookingsForReviewAsync(string farmerId);
        Task<PagedResult<ReviewResponseDto>> GetMachineReviewsPagedAsync(int machineId, int page, int limit);
    }
}
