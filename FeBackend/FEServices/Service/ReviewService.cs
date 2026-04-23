using AutoMapper;
using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.DTO;
using FECommon.Exceptions;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;

        public ReviewService(IUnitOfWork unitOfWork, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
        }

        public async Task<(bool Success, string Message, ReviewResponseDto? Review)> CreateReviewAsync(CreateReviewDto request, string farmerId, string farmerName)
        {
            try
            {
                // Get the booking
                var booking = await _unitOfWork.Bookings.GetByIdAsync(request.BookingId);
                if (booking == null)
                    return (false, "Booking not found.", null);

                // Verify the booking belongs to this farmer
                if (!string.Equals(booking.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "You can only review your own bookings.", null);

                // Verify the booking is completed
                if (booking.Status != "Completed")
                    return (false, "You can only review completed bookings.", null);

                // Check if already reviewed
                var existingReview = await _unitOfWork.Reviews.GetByBookingIdAsync(request.BookingId);
                if (existingReview != null)
                    return (false, "You have already reviewed this booking.", null);

                // Create the review
                var review = new Review
                {
                    BookingId = request.BookingId,
                    MachineId = booking.MachineId,
                    MachineName = booking.MachineName,
                    FarmerId = farmerId,
                    FarmerName = farmerName,
                    OwnerId = booking.OwnerId ?? string.Empty,
                    Rating = request.Rating,
                    Comment = request.Comment?.Trim(),
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Reviews.AddAsync(review);
                await _unitOfWork.SaveChangesAsync();

                var response = _mapper.Map<ReviewResponseDto>(review);
                return (true, "Review submitted successfully.", response);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to create review", ex);
            }
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetMachineReviewsAsync(int machineId)
        {
            try
            {
                var reviews = await _unitOfWork.Reviews.GetByMachineIdAsync(machineId);
                return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve machine reviews", ex);
            }
        }

        public async Task<MachineRatingSummaryDto> GetMachineRatingSummaryAsync(int machineId)
        {
            try
            {
                var reviews = await _unitOfWork.Reviews.Query()
                    .AsNoTracking()
                    .Where(r => r.MachineId == machineId)
                    .ToListAsync();

                var machine = await _unitOfWork.Machines.GetByIdAsync(machineId);

                if (!reviews.Any())
                {
                    return new MachineRatingSummaryDto
                    {
                        MachineId = machineId,
                        MachineName = machine?.Name ?? "Unknown",
                        AverageRating = 0,
                        TotalReviews = 0,
                        Rating1 = 0,
                        Rating2 = 0,
                        Rating3 = 0,
                        Rating4 = 0,
                        Rating5 = 0
                    };
                }

                return new MachineRatingSummaryDto
                {
                    MachineId = machineId,
                    MachineName = machine?.Name ?? "Unknown",
                    AverageRating = Math.Round(reviews.Average(r => r.Rating), 1),
                    TotalReviews = reviews.Count,
                    Rating1 = reviews.Count(r => r.Rating == 1),
                    Rating2 = reviews.Count(r => r.Rating == 2),
                    Rating3 = reviews.Count(r => r.Rating == 3),
                    Rating4 = reviews.Count(r => r.Rating == 4),
                    Rating5 = reviews.Count(r => r.Rating == 5)
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve rating summary", ex);
            }
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetFarmerReviewsAsync(string farmerId)
        {
            try
            {
                var reviews = await _unitOfWork.Reviews.GetByFarmerIdAsync(farmerId);
                return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve farmer reviews", ex);
            }
        }

        public async Task<IEnumerable<ReviewResponseDto>> GetOwnerReviewsAsync(string ownerId)
        {
            try
            {
                var reviews = await _unitOfWork.Reviews.GetByOwnerIdAsync(ownerId);
                return _mapper.Map<IEnumerable<ReviewResponseDto>>(reviews);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve owner reviews", ex);
            }
        }

        public async Task<ReviewEligibilityDto> CheckReviewEligibilityAsync(int bookingId, string farmerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(bookingId);

                if (booking == null)
                {
                    return new ReviewEligibilityDto
                    {
                        BookingId = bookingId,
                        MachineId = 0,
                        MachineName = "Unknown",
                        CanReview = false,
                        Reason = "Booking not found.",
                        HasReviewed = false
                    };
                }

                var hasReviewed = await _unitOfWork.Reviews.HasReviewedAsync(bookingId);

                if (!string.Equals(booking.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                {
                    return new ReviewEligibilityDto
                    {
                        BookingId = bookingId,
                        MachineId = booking.MachineId,
                        MachineName = booking.MachineName ?? "Unknown",
                        CanReview = false,
                        Reason = "You can only review your own bookings.",
                        HasReviewed = hasReviewed
                    };
                }

                if (booking.Status != "Completed")
                {
                    return new ReviewEligibilityDto
                    {
                        BookingId = bookingId,
                        MachineId = booking.MachineId,
                        MachineName = booking.MachineName ?? "Unknown",
                        CanReview = false,
                        Reason = "Only completed bookings can be reviewed.",
                        HasReviewed = hasReviewed
                    };
                }

                if (hasReviewed)
                {
                    return new ReviewEligibilityDto
                    {
                        BookingId = bookingId,
                        MachineId = booking.MachineId,
                        MachineName = booking.MachineName ?? "Unknown",
                        CanReview = false,
                        Reason = "You have already reviewed this booking.",
                        HasReviewed = true
                    };
                }

                return new ReviewEligibilityDto
                {
                    BookingId = bookingId,
                    MachineId = booking.MachineId,
                    MachineName = booking.MachineName ?? "Unknown",
                    CanReview = true,
                    Reason = null,
                    HasReviewed = false
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to check review eligibility", ex);
            }
        }

        public async Task<ReviewResponseDto?> GetReviewByBookingIdAsync(int bookingId)
        {
            try
            {
                var review = await _unitOfWork.Reviews.GetByBookingIdAsync(bookingId);
                return review == null ? null : _mapper.Map<ReviewResponseDto>(review);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve review by booking ID", ex);
            }
        }

        public async Task<IEnumerable<ReviewEligibilityDto>> GetEligibleBookingsForReviewAsync(string farmerId)
        {
            try
            {
                // Get completed bookings for this farmer
                var completedBookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Where(b => b.FarmerId == farmerId && b.Status == "Completed")
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = completedBookings.Select(b => b.Id).ToList();
                var reviewedBookingIds = await _unitOfWork.Reviews.Query()
                    .AsNoTracking()
                    .Where(r => bookingIds.Contains(r.BookingId))
                    .Select(r => r.BookingId)
                    .ToListAsync();

                return completedBookings.Select(b => new ReviewEligibilityDto
                {
                    BookingId = b.Id,
                    MachineId = b.MachineId,
                    MachineName = b.MachineName ?? "Unknown",
                    CanReview = !reviewedBookingIds.Contains(b.Id),
                    Reason = reviewedBookingIds.Contains(b.Id) ? "Already reviewed." : null,
                    HasReviewed = reviewedBookingIds.Contains(b.Id)
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve eligible bookings", ex);
            }
        }

        public async Task<PagedResult<ReviewResponseDto>> GetMachineReviewsPagedAsync(int machineId, int page, int limit)
        {
            try
            {
                var query = _unitOfWork.Reviews.Query()
                    .AsNoTracking()
                    .Where(r => r.MachineId == machineId);

                var totalItems = await query.CountAsync();

                var reviews = await query
                    .OrderByDescending(r => r.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync();

                var result = _mapper.Map<List<ReviewResponseDto>>(reviews);

                return new PagedResult<ReviewResponseDto>(result, totalItems, page, limit);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve paged reviews", ex);
            }
        }
    }
}
