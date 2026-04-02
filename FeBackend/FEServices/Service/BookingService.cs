using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.DTO;
using FECommon.Exceptions;
using FECommon.Enums;
using Microsoft.EntityFrameworkCore;

namespace FEServices.Service
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPaymentService _paymentService;

        public BookingService(IUnitOfWork unitOfWork, IPaymentService paymentService)
        {
            _unitOfWork = unitOfWork;
            _paymentService = paymentService;
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetAllBookingsAsync()
        {
            try
            {
                var bookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Include(b => b.Machine)
                    .Include(b => b.Farmer)
                    .Include(b => b.Owner)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Any()
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : new List<Payment>();

                return bookings.Select(b => {
                    var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                    return new BookingSummaryDto
                    {
                        Id = b.Id,
                        MachineId = b.MachineId,
                        MachineName = b.Machine?.Name ?? "Unknown",
                        FarmerId = b.FarmerId,
                        FarmerName = b.Farmer?.FullName ?? "Unknown",
                        OwnerId = b.OwnerId,
                        OwnerName = b.Owner?.FullName ?? "Unknown",
                        Location = b.Machine?.Location ?? b.Owner?.Location ?? "",
                        Hours = b.Hours,
                        BaseAmount = b.BaseAmount,
                        PlatformFee = b.PlatformFee,
                        TotalAmount = b.TotalAmount,
                        Status = b.Status.ToDisplayString(),
                        CreatedAt = b.CreatedAt,
                        IsRefunded = payment?.RefundAmount > 0
                    };
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve bookings", ex);
            }
        }

        public async Task<PagedResult<BookingSummaryDto>> GetAllBookingsPagedAsync(int page, int limit, string? search, string? status, CancellationToken cancellationToken = default)
        {
            try
            {
                IQueryable<Booking> query = _unitOfWork.Bookings.Query()
                    .Include(b => b.Machine)
                    .Include(b => b.Farmer)
                    .Include(b => b.Owner);

                // Apply status filter at DB level - parse string to enum
                BookingStatus? statusEnum = null;
                if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
                {
                    statusEnum = BookingStatusExtensions.FromString(status);
                    query = query.Where(b => b.Status == statusEnum.Value);
                }

                // Apply search filter at DB level BEFORE pagination - now using navigation properties
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(b => 
                        (b.Machine != null && b.Machine.Name != null && b.Machine.Name.Contains(search)) ||
                        (b.Farmer != null && b.Farmer.FullName != null && b.Farmer.FullName.Contains(search)) ||
                        (b.OwnerId != null && b.OwnerId.Contains(search)));
                }

                // Total count AFTER all filters
                var totalItems = await query.CountAsync(cancellationToken);

                // Get paged bookings with navigation properties already loaded
                var bookings = await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync(cancellationToken);

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = await _unitOfWork.Payments.Query()
                    .Where(p => bookingIds.Contains(p.BookingId))
                    .ToListAsync(cancellationToken);

                var refundedBookingIds = payments
                    .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                    .Select(p => p.BookingId)
                    .ToHashSet();

                // Map data to DTO using navigation properties
                var result = bookings.Select(b =>
                {
                    var isRefunded = refundedBookingIds.Contains(b.Id);

                    return new BookingSummaryDto
                    {
                        Id = b.Id,
                        MachineId = b.MachineId,
                        MachineName = b.Machine?.Name ?? "Unknown",
                        FarmerId = b.FarmerId,
                        FarmerName = b.Farmer?.FullName ?? "Unknown",
                        OwnerId = b.OwnerId,
                        OwnerName = b.Owner?.FullName ?? "Unknown",
                        Location = b.Machine?.Location ?? b.Owner?.Location ?? "",
                        Hours = b.Hours,
                        BaseAmount = b.BaseAmount,
                        PlatformFee = b.PlatformFee,
                        TotalAmount = b.TotalAmount,
                        Status = b.Status.ToDisplayString(),
                        CreatedAt = b.CreatedAt,
                        IsRefunded = isRefunded
                    };
                }).ToList();

                // Combined stats query - single DB roundtrip
                var stats = await _unitOfWork.Bookings.Query()
                    .GroupBy(b => 1)
                    .Select(g => new
                    {
                        ActiveCount = g.Count(b => b.Status == BookingStatus.Active),
                        CompletedCount = g.Count(b => b.Status == BookingStatus.Completed),
                        TotalRevenue = g.Where(b => b.Status == BookingStatus.Completed).Sum(b => b.PlatformFee)
                    })
                    .FirstOrDefaultAsync(cancellationToken);

                return new PagedResult<BookingSummaryDto>(result, totalItems, page, limit)
                {
                    Summary = new
                    {
                        ActiveCount = stats?.ActiveCount ?? 0,
                        CompletedCount = stats?.CompletedCount ?? 0,
                        TotalRevenue = stats?.TotalRevenue ?? 0
                    }
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve paged bookings", ex);
            }
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetOwnerBookingsAsync(string ownerId)
        {
            try
            {
                var bookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Include(b => b.Machine)
                    .Include(b => b.Farmer)
                    .Include(b => b.Owner)
                    .Where(b => b.OwnerId == ownerId)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Any()
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : new List<Payment>();

                return bookings.Select(b => {
                    var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                    return new BookingSummaryDto
                    {
                        Id = b.Id,
                        MachineId = b.MachineId,
                        MachineName = b.Machine?.Name ?? "Unknown",
                        FarmerId = b.FarmerId,
                        FarmerName = b.Farmer?.FullName ?? "Unknown",
                        OwnerId = b.OwnerId,
                        OwnerName = b.Owner?.FullName ?? "Unknown",
                        Location = b.Machine?.Location ?? b.Owner?.Location ?? "",
                        Hours = b.Hours,
                        BaseAmount = b.BaseAmount,
                        PlatformFee = b.PlatformFee,
                        TotalAmount = b.TotalAmount,
                        Status = b.Status.ToDisplayString(),
                        CreatedAt = b.CreatedAt,
                        IsRefunded = payment?.RefundAmount > 0
                    };
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve owner bookings", ex);
            }
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetFarmerBookingsAsync(string farmerId)
        {
            try
            {
                var farmerBookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Include(b => b.Machine)
                    .Include(b => b.Owner)
                    .Where(b => b.FarmerId == farmerId)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = farmerBookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Any()
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : new List<Payment>();
                
                return farmerBookings.Select(b => {
                    var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                    return new BookingSummaryDto
                    {
                        Id = b.Id,
                        MachineId = b.MachineId,
                        MachineName = b.Machine?.Name ?? "Unknown",
                        FarmerId = b.FarmerId,
                        FarmerName = b.Farmer?.FullName ?? "Unknown",
                        OwnerId = b.OwnerId,
                        OwnerName = b.Owner?.FullName ?? "Unknown",
                        Location = b.Machine?.Location ?? b.Owner?.Location ?? "",
                        Hours = b.Hours,
                        BaseAmount = b.BaseAmount,
                        PlatformFee = b.PlatformFee,
                        TotalAmount = b.TotalAmount,
                        Status = b.Status.ToDisplayString(),
                        CreatedAt = b.CreatedAt,
                        IsRefunded = payment?.RefundAmount > 0
                    };
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve farmer bookings", ex);
            }
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            try
            {
                return await _unitOfWork.Bookings.GetByIdAsync(id);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve booking", ex);
            }
        }

        public async Task<(bool Success, string Message, Booking? Booking)> CreateAsync(CreateBookingDto request, string farmerId, string farmerName)
        {
            try
            {
                var machine = await _unitOfWork.Machines.Query()
                    .Include(m => m.Owner)
                    .FirstOrDefaultAsync(m => m.Id == request.MachineId);

                if (machine == null || machine.Status != "Active")
                    return (false, "Invalid or unavailable machine.", null);

                int safeHours = request.Hours > 0 ? request.Hours : 1;
                var rate = machine.Rate > 0 ? machine.Rate : 1;

                var booking = new Booking
                {
                    MachineId = machine.Id,
                    FarmerId = farmerId,
                    OwnerId = machine.OwnerId,
                    Hours = safeHours,
                    BaseAmount = rate * safeHours,
                    PlatformFee = (rate * safeHours) * 0.10m,
                    TotalAmount = (rate * safeHours) * 1.10m,
                    Status = BookingStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Bookings.AddAsync(booking);

                var ownerNotification = new Notification
                {
                    UserId = machine.OwnerId,
                    Title = "New Booking Request",
                    Message = $"New rental request from {farmerName} for your {machine.Name}.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(ownerNotification);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Booking created!", booking);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to create booking", ex);
            }
        }

        public async Task<(bool Success, string Message)> AcceptAsync(int id, string ownerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                booking.Status = BookingStatus.Accepted;
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.FarmerId,
                    Title = "Booking Accepted",
                    Message = $"Your request for {booking.Machine?.Name ?? "the machine"} was ACCEPTED!",
                    Type = "success",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Booking accepted!");
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to accept booking", ex);
            }
        }

        public async Task<(bool Success, string Message)> RejectAsync(int id, string ownerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                booking.Status = BookingStatus.Rejected;
                _unitOfWork.Bookings.Update(booking);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Booking rejected.");
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to reject booking", ex);
            }
        }

        public async Task<(bool Success, string Message)> CompleteAsync(int id, string ownerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                booking.Status = BookingStatus.Completed;
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.FarmerId,
                    Title = "Booking Completed",
                    Message = $"The job for {booking.Machine?.Name ?? "the machine"} has been marked as COMPLETED.",
                    Type = "success",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Booking completed!");
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to complete booking", ex);
            }
        }

        public async Task<(bool Success, string Message)> CancelAsync(int id, string farmerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                // Handle pending bookings - just delete
                if (booking.Status == BookingStatus.Pending)
                {
                    _unitOfWork.Bookings.Delete(booking);
                    await _unitOfWork.SaveChangesAsync();
                    return (true, "Booking cancelled.");
                }

                // Handle active bookings - process refund
                if (booking.Status == BookingStatus.Active)
                {
                    var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                    if (!success)
                        return (false, $"Failed to process refund: {message}");
                    
                    return (true, "Booking cancelled and refund processed successfully.");
                }

                // Handle accepted bookings - check if payment exists
                if (booking.Status == BookingStatus.Accepted)
                {
                    var payment = await _unitOfWork.Payments.Query()
                        .FirstOrDefaultAsync(p => p.BookingId == id && p.Status == "Captured");
                    
                    if (payment != null)
                    {
                        // Payment was made, process refund
                        var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                        if (!success)
                            return (false, $"Failed to process refund: {message}");
                        
                        return (true, "Booking cancelled and refund processed successfully.");
                    }
                    
                    // No payment, just update status
                    booking.Status = BookingStatus.Cancelled;
                    _unitOfWork.Bookings.Update(booking);
                    
                    var notification = new Notification
                    {
                        UserId = booking.OwnerId,
                        Title = "Booking Cancelled",
                        Message = $"Booking for {booking.Machine?.Name ?? "the machine"} has been cancelled by the farmer.",
                        Type = "info",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Notifications.AddAsync(notification);
                    await _unitOfWork.SaveChangesAsync();
                    
                    return (true, "Booking cancelled.");
                }

                return (false, $"Cannot cancel booking with status '{booking.Status.ToDisplayString()}'.");
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to cancel booking", ex);
            }
        }

        public async Task<(bool Success, string Message)> PayAsync(int id, string farmerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                if (booking.Status != BookingStatus.Accepted)
                    return (false, "Only accepted bookings can be paid for.");

                booking.Status = BookingStatus.Active;
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.OwnerId,
                    Title = "Payment Received",
                    Message = $"Payment successful! The rental for {booking.Machine?.Name ?? "the machine"} is now ACTIVE.",
                    Type = "success",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();

                return (true, "Payment successful!");
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to process payment", ex);
            }
        }

        public async Task<OwnerDashboardStatsDto> GetOwnerDashboardStatsAsync(string ownerId)
        {
            try
            {
                var machineIds = await _unitOfWork.Machines.Query()
                    .Where(m => m.OwnerId == ownerId)
                    .Select(m => m.Id)
                    .ToListAsync();

                var totalMachines = machineIds.Count;

                var activeCount = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == BookingStatus.Active)
                    .CountAsync();

                var completedCount = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == BookingStatus.Completed)
                    .CountAsync();

                var pendingCount = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && (b.Status == BookingStatus.Pending || b.Status == BookingStatus.PendingOwnerApproval))
                    .CountAsync();

                var totalRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == BookingStatus.Completed)
                    .SumAsync(b => b.TotalAmount);

                var platformFees = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == BookingStatus.Completed)
                    .SumAsync(b => b.PlatformFee);

                return new OwnerDashboardStatsDto
                {
                    TotalMachines = totalMachines,
                    ActiveBookings = activeCount,
                    CompletedBookings = completedCount,
                    TotalRevenue = totalRevenue - platformFees,
                    PlatformFeesEarned = platformFees,
                    PendingBookings = pendingCount
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve owner dashboard stats", ex);
            }
        }

        public async Task<FarmerDashboardStatsDto> GetFarmerStatsAsync(string farmerId)
        {
            try
            {
                var totalBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId)
                    .CountAsync();
                var activeBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && (b.Status == BookingStatus.Accepted || b.Status == BookingStatus.Pending))
                    .CountAsync();
                var completedBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == BookingStatus.Completed)
                    .CountAsync();
                var pendingBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == BookingStatus.Pending)
                    .CountAsync();
                var totalSpent = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == BookingStatus.Completed)
                    .SumAsync(b => b.TotalAmount);

                return new FarmerDashboardStatsDto
                {
                    TotalBookings = totalBookings,
                    ActiveBookings = activeBookings,
                    CompletedBookings = completedBookings,
                    TotalSpent = totalSpent,
                    PendingBookings = pendingBookings
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve farmer stats", ex);
            }
        }

        public async Task<AdminDashboardStatsDto> GetAdminStatsAsync(CancellationToken cancellationToken = default)
        {
            try
            {
                var totalUsers = await _unitOfWork.Users.Query().CountAsync(cancellationToken);
                var totalFarmers = await _unitOfWork.Users.Query().CountAsync(u => u.Role == "farmer", cancellationToken);
                var totalOwners = await _unitOfWork.Users.Query().CountAsync(u => u.Role == "owner", cancellationToken);

                var totalMachines = await _unitOfWork.Machines.Query().CountAsync(cancellationToken);

                var totalBookings = await _unitOfWork.Bookings.Query().CountAsync(cancellationToken);
                var activeBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == BookingStatus.Active)
                    .CountAsync(cancellationToken);
                var completedBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == BookingStatus.Completed)
                    .CountAsync(cancellationToken);

                var totalRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == BookingStatus.Completed)
                    .SumAsync(b => b.TotalAmount, cancellationToken);
                var platformRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == BookingStatus.Completed)
                    .SumAsync(b => b.PlatformFee, cancellationToken);

                var recentBookingsData = await _unitOfWork.Bookings.Query()
                    .Include(b => b.Machine)
                    .Include(b => b.Farmer)
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(5)
                    .ToListAsync(cancellationToken);

                var recentBookings = recentBookingsData.Select(b => new RecentBookingDto
                {
                    Id = b.Id,
                    MachineName = b.Machine != null ? b.Machine.Name : "Unknown",
                    FarmerName = b.Farmer != null ? b.Farmer.FullName : "Unknown",
                    OwnerName = "",
                    Status = b.Status.ToDisplayString(),
                    TotalAmount = b.TotalAmount,
                    CreatedAt = b.CreatedAt
                }).ToList();

                return new AdminDashboardStatsDto
                {
                    TotalUsers = totalUsers,
                    TotalFarmers = totalFarmers,
                    TotalOwners = totalOwners,
                    TotalMachines = totalMachines,
                    TotalBookings = totalBookings,
                    ActiveBookings = activeBookings,
                    CompletedBookings = completedBookings,
                    TotalRevenue = totalRevenue,
                    PlatformRevenue = platformRevenue,
                    RecentBookings = recentBookings
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve admin stats", ex);
            }
        }

        public async Task<IEnumerable<MonthlyRevenueDto>> GetRevenueByMonthAsync()
        {
            try
            {
                var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

                var rawData = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == BookingStatus.Completed && b.CreatedAt >= sixMonthsAgo)
                    .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                    .Select(g => new
                    {
                        MonthNum = g.Key.Month,
                        Year = g.Key.Year,
                        Revenue = g.Sum(b => b.TotalAmount),
                        BookingCount = g.Count()
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.MonthNum)
                    .ToListAsync();

                if (!rawData.Any())
                {
                    var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                    var today = DateTime.UtcNow;
                    var dummyData = new List<MonthlyRevenueDto>();
                    for (int i = 5; i >= 0; i--)
                    {
                        var targetDate = today.AddMonths(-i);
                        dummyData.Add(new MonthlyRevenueDto
                        {
                            Month = months[targetDate.Month - 1],
                            Year = targetDate.Year,
                            Revenue = 0,
                            BookingCount = 0
                        });
                    }
                    return dummyData;
                }

                var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                return rawData.Select(x => new MonthlyRevenueDto
                {
                    Month = monthNames[x.MonthNum - 1],
                    Year = x.Year,
                    Revenue = x.Revenue,
                    BookingCount = x.BookingCount
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve revenue by month", ex);
            }
        }
    }
}
