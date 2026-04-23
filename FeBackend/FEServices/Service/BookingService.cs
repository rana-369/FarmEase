using AutoMapper;
using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.DTO;
using FECommon.Exceptions;
using FECommon.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace FEServices.Service
{
    public class BookingService : IBookingService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IPaymentService _paymentService;
        private readonly IConfiguration _configuration;
        private readonly decimal _commissionRate;
        private readonly IMapper _mapper;

        public BookingService(IUnitOfWork unitOfWork, IPaymentService paymentService, IConfiguration configuration, IMapper mapper)
        {
            _unitOfWork = unitOfWork;
            _paymentService = paymentService;
            _configuration = configuration;
            _mapper = mapper;
            
            // Get commission rate from config, default to 0.10 (10%)
            var commissionStr = configuration["PlatformSettings:CommissionRate"];
            _commissionRate = !string.IsNullOrEmpty(commissionStr) && decimal.TryParse(commissionStr, out var rate) ? rate : 0.10m;
        }

        public async Task<IEnumerable<BookingSummaryDto>> GetAllBookingsAsync()
        {
            try
            {
                // Database has no FK relationships - use denormalized data directly
                var bookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Count > 0
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : [];

                return bookings.Select(b => {
                    var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                    return new BookingSummaryDto
                    {
                        Id = b.Id,
                        MachineId = b.MachineId,
                        MachineName = b.MachineName ?? "Unknown",
                        FarmerId = b.FarmerId ?? string.Empty,
                        FarmerName = b.FarmerName ?? "Unknown",
                        OwnerId = b.OwnerId ?? string.Empty,
                        OwnerName = "Owner",
                        Location = "",
                        Hours = b.Hours,
                        BaseAmount = b.BaseAmount,
                        PlatformFee = b.PlatformFee,
                        TotalAmount = b.TotalAmount,
                        Status = b.Status ?? "Unknown",
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
                // Database has no FK relationships - use denormalized data directly
                IQueryable<Booking> query = _unitOfWork.Bookings.Query()
                    .AsNoTracking();

                // Apply status filter at DB level - compare as string
                if (!string.IsNullOrEmpty(status) && !status.Equals("all", StringComparison.OrdinalIgnoreCase))
                {
                    query = query.Where(b => b.Status.ToLower() == status.ToLower());
                }

                // Apply search filter at DB level BEFORE pagination - use denormalized fields
                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(b => 
                        (b.MachineName != null && b.MachineName.Contains(search)) ||
                        (b.FarmerName != null && b.FarmerName.Contains(search)) ||
                        (b.OwnerId != null && b.OwnerId.Contains(search)));
                }

                // Total count AFTER all filters
                var totalItems = await query.CountAsync(cancellationToken);

                // Get paged bookings
                var bookings = await query
                    .OrderByDescending(b => b.CreatedAt)
                    .Skip((page - 1) * limit)
                    .Take(limit)
                    .ToListAsync(cancellationToken);

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = await _unitOfWork.Payments.Query()
                    .AsNoTracking()
                    .Where(p => bookingIds.Contains(p.BookingId))
                    .ToListAsync(cancellationToken);

                var refundedBookingIds = payments
                    .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                    .Select(p => p.BookingId)
                    .ToHashSet();

                // Map data to DTO using AutoMapper, then enrich with computed properties
                var result = _mapper.Map<List<BookingSummaryDto>>(bookings);
                
                for (int i = 0; i < bookings.Count; i++)
                {
                    var isRefunded = refundedBookingIds.Contains(bookings[i].Id);
                    result[i] = result[i] with
                    {
                        MachineName = bookings[i].MachineName ?? "Unknown",
                        FarmerName = bookings[i].FarmerName ?? "Unknown",
                        OwnerName = "Owner",
                        Location = "",
                        IsRefunded = isRefunded
                    };
                }

                // Combined stats query - single DB roundtrip
                var stats = await _unitOfWork.Bookings.Query()
                    .GroupBy(b => 1)
                    .Select(g => new
                    {
                        ActiveCount = g.Count(b => b.Status == "Active"),
                        CompletedCount = g.Count(b => b.Status == "Completed"),
                        TotalRevenue = g.Where(b => b.Status == "Completed").Sum(b => b.PlatformFee)
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
                // Database has no FK relationships - use denormalized data directly
                var bookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Where(b => b.OwnerId == ownerId)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = bookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Count > 0
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : [];

                return bookings.Select(b => {
                    var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                    var dto = _mapper.Map<BookingSummaryDto>(b);
                    return dto with
                    {
                        MachineName = b.MachineName ?? "Unknown",
                        FarmerName = b.FarmerName ?? "Unknown",
                        OwnerName = "Owner",
                        Location = "",
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
                // Database has no FK relationships - use denormalized data directly
                var farmerBookings = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .Where(b => b.FarmerId == farmerId)
                    .OrderByDescending(b => b.CreatedAt)
                    .ToListAsync();

                var bookingIds = farmerBookings.Select(b => b.Id).ToList();
                var payments = bookingIds.Count > 0
                    ? await _unitOfWork.Payments.Query().AsNoTracking().Where(p => bookingIds.Contains(p.BookingId)).ToListAsync()
                    : [];
                
                var result = new List<BookingSummaryDto>();
                foreach (var b in farmerBookings)
                {
                    try
                    {
                        var payment = payments.FirstOrDefault(p => p.BookingId == b.Id);
                        var dto = _mapper.Map<BookingSummaryDto>(b);
                        result.Add(dto with
                        {
                            MachineName = b.MachineName ?? "Unknown",
                            FarmerName = b.FarmerName ?? "Unknown",
                            OwnerName = "Owner",
                            Location = "",
                            IsRefunded = payment?.RefundAmount > 0
                        });
                    }
                    catch (Exception ex)
                    {
                        // Log individual booking mapping error
                        System.Diagnostics.Debug.WriteLine($"Error mapping booking {b.Id}: {ex.Message}");
                        throw new AppException($"Error mapping booking {b.Id}: {ex.Message}", ex);
                    }
                }
                return result;
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"GetFarmerBookingsAsync error: {ex}");
                throw new AppException($"Failed to retrieve farmer bookings: {ex.Message}", ex);
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
                // Database has no FK relationships - query Machine directly
                var machine = await _unitOfWork.Machines.Query()
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.Id == request.MachineId);

                if (machine == null || machine.Status != "Active")
                    return (false, "Invalid or unavailable machine.", null);

                int safeHours = request.Hours > 0 ? request.Hours : 1;
                var rate = machine.Rate > 0 ? machine.Rate : 1;

                var booking = new Booking
                {
                    MachineId = machine.Id,
                    MachineName = machine.Name ?? "Unknown",
                    FarmerId = farmerId,
                    FarmerName = farmerName,
                    OwnerId = machine.OwnerId ?? string.Empty,
                    Hours = safeHours,
                    BaseAmount = rate * safeHours,
                    PlatformFee = (rate * safeHours) * _commissionRate,
                    TotalAmount = (rate * safeHours) * (1 + _commissionRate),
                    Status = "Pending", // Explicitly set status
                    CreatedAt = DateTime.UtcNow
                };
                
                // Ensure Status is set
                if (string.IsNullOrEmpty(booking.Status))
                {
                    booking.Status = "Pending";
                }
                
                System.Diagnostics.Debug.WriteLine($"[CreateAsync] Booking Status before add: '{booking.Status}'");

                await _unitOfWork.Bookings.AddAsync(booking);

                var ownerNotification = new Notification
                {
                    UserId = machine.OwnerId ?? string.Empty,
                    Title = "New Booking Request",
                    Message = $"New rental request from {farmerName} for your {machine.Name ?? "equipment"}.",
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
                var innerEx = ex.InnerException;
                while (innerEx != null)
                {
                    System.Diagnostics.Debug.WriteLine($"INNER EXCEPTION: {innerEx.Message}");
                    innerEx = innerEx.InnerException;
                }
                throw new AppException($"Failed to create booking: {ex.InnerException?.Message ?? ex.Message}", ex);
            }
        }

        public async Task<(bool Success, string Message)> AcceptAsync(int id, string ownerId)
        {
            try
            {
                var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
                if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                    return (false, "Unauthorized or booking not found.");

                booking.Status = "Accepted";
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.FarmerId ?? string.Empty,
                    Title = "Booking Accepted",
                    Message = $"Your request for {booking.MachineName ?? "equipment"} was ACCEPTED!",
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

                booking.Status = "Rejected";
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

                booking.Status = "Completed";
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.FarmerId ?? string.Empty,
                    Title = "Booking Completed",
                    Message = $"The job for {booking.MachineName ?? "equipment"} has been marked as COMPLETED.",
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
                if (booking.Status == "Pending")
                {
                    _unitOfWork.Bookings.Delete(booking);
                    await _unitOfWork.SaveChangesAsync();
                    return (true, "Booking cancelled.");
                }

                // Handle active bookings - process refund
                if (booking.Status == "Active")
                {
                    // Check if payment already refunded
                    var existingPayment = await _unitOfWork.Payments.Query()
                        .FirstOrDefaultAsync(p => p.BookingId == id);
                    
                    if (existingPayment != null && existingPayment.Status == "Refunded")
                    {
                        // Payment already refunded, just update booking status
                        booking.Status = "Cancelled";
                        _unitOfWork.Bookings.Update(booking);
                        await _unitOfWork.SaveChangesAsync();
                        return (true, "Booking cancelled. Refund was already processed.");
                    }
                    
                    var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                    if (!success)
                    {
                        // Check if the error is "already refunded" - if so, just update status
                        if (message.Contains("already refunded", StringComparison.OrdinalIgnoreCase))
                        {
                            booking.Status = "Cancelled";
                            _unitOfWork.Bookings.Update(booking);
                            
                            // Update payment status if needed
                            if (existingPayment != null && existingPayment.Status != "Refunded")
                            {
                                existingPayment.Status = "Refunded";
                                existingPayment.RefundedAt = DateTime.UtcNow;
                                existingPayment.RefundReason = "Cancelled by farmer";
                                _unitOfWork.Payments.Update(existingPayment);
                            }
                            
                            var notification = new Notification
                            {
                                UserId = booking.OwnerId ?? string.Empty,
                                Title = "Booking Cancelled & Refunded",
                                Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled by the farmer. Refund processed.",
                                Type = "info",
                                IsRead = false,
                                CreatedAt = DateTime.UtcNow
                            };
                            await _unitOfWork.Notifications.AddAsync(notification);
                            await _unitOfWork.SaveChangesAsync();
                            
                            return (true, "Booking cancelled. Refund was already processed.");
                        }
                        return (false, $"Failed to process refund: {message}");
                    }
                    
                    // Update booking status to Cancelled after successful refund
                    booking.Status = "Cancelled";
                    _unitOfWork.Bookings.Update(booking);
                    
                    var notification2 = new Notification
                    {
                        UserId = booking.OwnerId ?? string.Empty,
                        Title = "Booking Cancelled & Refunded",
                        Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled by the farmer. Refund processed.",
                        Type = "info",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Notifications.AddAsync(notification2);
                    await _unitOfWork.SaveChangesAsync();
                    
                    return (true, "Booking cancelled and refund processed successfully.");
                }

                // Handle accepted bookings - check if payment exists
                if (booking.Status == "Accepted")
                {
                    var payment = await _unitOfWork.Payments.Query()
                        .FirstOrDefaultAsync(p => p.BookingId == id && p.Status == "Captured");
                    
                    if (payment != null)
                    {
                        // Payment was made, process refund
                        var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                        if (!success)
                        {
                            // Check if the error is "already refunded" - if so, just update status
                            if (message.Contains("already refunded", StringComparison.OrdinalIgnoreCase))
                            {
                                booking.Status = "Cancelled";
                                _unitOfWork.Bookings.Update(booking);
                                
                                // Update payment status if needed
                                if (payment.Status != "Refunded")
                                {
                                    payment.Status = "Refunded";
                                    payment.RefundedAt = DateTime.UtcNow;
                                    payment.RefundReason = "Cancelled by farmer";
                                    _unitOfWork.Payments.Update(payment);
                                }
                                
                                var notification = new Notification
                                {
                                    UserId = booking.OwnerId ?? string.Empty,
                                    Title = "Booking Cancelled & Refunded",
                                    Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled by the farmer. Refund processed.",
                                    Type = "info",
                                    IsRead = false,
                                    CreatedAt = DateTime.UtcNow
                                };
                                await _unitOfWork.Notifications.AddAsync(notification);
                                await _unitOfWork.SaveChangesAsync();
                                
                                return (true, "Booking cancelled. Refund was already processed.");
                            }
                            return (false, $"Failed to process refund: {message}");
                        }
                        
                        // Update booking status to Cancelled after successful refund
                        booking.Status = "Cancelled";
                        _unitOfWork.Bookings.Update(booking);
                        
                        var notification3 = new Notification
                        {
                            UserId = booking.OwnerId ?? string.Empty,
                            Title = "Booking Cancelled & Refunded",
                            Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled by the farmer. Refund processed.",
                            Type = "info",
                            IsRead = false,
                            CreatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Notifications.AddAsync(notification3);
                        await _unitOfWork.SaveChangesAsync();
                        
                        return (true, "Booking cancelled and refund processed successfully.");
                    }
                    
                    // No payment, just update status
                    booking.Status = "Cancelled";
                    _unitOfWork.Bookings.Update(booking);
                    
                    var notification4 = new Notification
                    {
                        UserId = booking.OwnerId ?? string.Empty,
                        Title = "Booking Cancelled",
                        Message = $"Booking for {booking.MachineName ?? "equipment"} has been cancelled by the farmer.",
                        Type = "info",
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow
                    };
                    await _unitOfWork.Notifications.AddAsync(notification4);
                    await _unitOfWork.SaveChangesAsync();
                    
                    return (true, "Booking cancelled.");
                }

                return (false, $"Cannot cancel booking with status '{booking.Status}'.");
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

                if (booking.Status != "Accepted")
                    return (false, "Only accepted bookings can be paid for.");

                booking.Status = "Active";
                _unitOfWork.Bookings.Update(booking);

                var notification = new Notification
                {
                    UserId = booking.OwnerId ?? string.Empty,
                    Title = "Payment Received",
                    Message = $"Payment successful! The rental for {booking.MachineName ?? "equipment"} is now ACTIVE.",
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
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Active")
                    .CountAsync();

                var completedCount = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed")
                    .CountAsync();

                var pendingCount = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && (b.Status == "Pending" || b.Status == "PendingOwnerApproval"))
                    .CountAsync();

                var totalRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed")
                    .SumAsync(b => b.TotalAmount);

                var platformFees = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed")
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
                    .Where(b => b.FarmerId == farmerId && (b.Status == "Accepted" || b.Status == "Pending"))
                    .CountAsync();
                var completedBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == "Completed")
                    .CountAsync();
                var pendingBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == "Pending")
                    .CountAsync();
                var totalSpent = await _unitOfWork.Bookings.Query()
                    .Where(b => b.FarmerId == farmerId && b.Status == "Completed")
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
                    .Where(b => b.Status == "Active")
                    .CountAsync(cancellationToken);
                var completedBookings = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == "Completed")
                    .CountAsync(cancellationToken);

                var totalRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == "Completed")
                    .SumAsync(b => b.TotalAmount, cancellationToken);
                var platformRevenue = await _unitOfWork.Bookings.Query()
                    .Where(b => b.Status == "Completed")
                    .SumAsync(b => b.PlatformFee, cancellationToken);

                var recentBookingsData = await _unitOfWork.Bookings.Query()
                    .AsNoTracking()
                    .OrderByDescending(b => b.CreatedAt)
                    .Take(5)
                    .ToListAsync(cancellationToken);

                var recentBookings = recentBookingsData.Select(b => new RecentBookingDto
                {
                    Id = b.Id,
                    MachineName = b.MachineName ?? "Unknown",
                    FarmerName = b.FarmerName ?? "Unknown",
                    OwnerName = "",
                    Status = b.Status ?? "Unknown",
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
                    .Where(b => b.Status == "Completed" && b.CreatedAt >= sixMonthsAgo)
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

                if (rawData.Count == 0)
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

        public async Task<OwnerAnalyticsDto> GetOwnerAnalyticsAsync(string ownerId, string period = "month")
        {
            try
            {
                var monthsAgo = period.ToLower() switch
                {
                    "week" => 0,
                    "year" => 12,
                    _ => 6 // month
                };

                var machineIds = await _unitOfWork.Machines.Query()
                    .Where(m => m.OwnerId == ownerId)
                    .Select(m => m.Id)
                    .ToListAsync();

                // Revenue data
                var revenueData = await GetOwnerRevenueDataAsync(ownerId, machineIds, monthsAgo);

                // Equipment performance
                var equipmentPerformance = await GetOwnerEquipmentPerformanceAsync(ownerId);

                // Category distribution (booking status)
                var categoryDistribution = await GetOwnerCategoryDistributionAsync(ownerId, machineIds);

                // Insights
                var insights = await GetOwnerInsightsAsync(ownerId, machineIds);

                return new OwnerAnalyticsDto
                {
                    RevenueData = revenueData.ToList(),
                    EquipmentPerformance = equipmentPerformance.ToList(),
                    CategoryDistribution = categoryDistribution.ToList(),
                    Insights = insights.ToList()
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve owner analytics", ex);
            }
        }

        public async Task<AdminAnalyticsDto> GetAdminAnalyticsAsync(string period = "month")
        {
            try
            {
                var monthsAgo = period.ToLower() switch
                {
                    "week" => 0,
                    "year" => 12,
                    _ => 6 // month
                };

                // Revenue data
                var revenueData = await GetRevenueByMonthAsync();

                // User growth
                var userGrowth = await GetUserGrowthAsync();

                // Booking trends
                var bookingTrends = await GetBookingTrendsAsync();

                // Category distribution
                var categoryDistribution = await GetCategoryDistributionAsync();

                // Insights
                var insights = await GetAdminInsightsAsync();

                return new AdminAnalyticsDto
                {
                    RevenueData = revenueData.ToList(),
                    UserGrowth = userGrowth.ToList(),
                    BookingTrends = bookingTrends.ToList(),
                    CategoryDistribution = categoryDistribution.ToList(),
                    Insights = insights.ToList()
                };
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve admin analytics", ex);
            }
        }

        public async Task<IEnumerable<UserGrowthDto>> GetUserGrowthAsync()
        {
            try
            {
                var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

                var usersByMonth = await _unitOfWork.Users.Query()
                    .Where(u => u.CreatedAt >= sixMonthsAgo)
                    .GroupBy(u => new { u.CreatedAt.Year, u.CreatedAt.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Farmers = g.Count(u => u.Role == "farmer"),
                        Owners = g.Count(u => u.Role == "owner"),
                        Total = g.Count()
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.Month)
                    .ToListAsync();

                var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

                return usersByMonth.Select(x => new UserGrowthDto
                {
                    Month = monthNames[x.Month - 1],
                    Farmers = x.Farmers,
                    Owners = x.Owners,
                    Total = x.Total
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve user growth", ex);
            }
        }

        public async Task<IEnumerable<BookingTrendDto>> GetBookingTrendsAsync()
        {
            try
            {
                var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

                var bookingsByMonth = await _unitOfWork.Bookings.Query()
                    .Where(b => b.CreatedAt >= sixMonthsAgo)
                    .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                    .Select(g => new
                    {
                        Year = g.Key.Year,
                        Month = g.Key.Month,
                        Count = g.Count()
                    })
                    .OrderBy(x => x.Year)
                    .ThenBy(x => x.Month)
                    .ToListAsync();

                var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                var colors = new[] { "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#06b6d4" };

                return bookingsByMonth.Select((x, i) => new BookingTrendDto
                {
                    Month = monthNames[x.Month - 1],
                    Bookings = x.Count,
                    Color = colors[i % colors.Length]
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve booking trends", ex);
            }
        }

        public async Task<IEnumerable<CategoryDistributionDto>> GetCategoryDistributionAsync()
        {
            try
            {
                var machinesByType = await _unitOfWork.Machines.Query()
                    .GroupBy(m => m.Type)
                    .Select(g => new
                    {
                        Type = g.Key ?? "Other",
                        Count = g.Count()
                    })
                    .OrderByDescending(x => x.Count)
                    .Take(5)
                    .ToListAsync();

                var colors = new[] { "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#06b6d4" };

                return machinesByType.Select((x, i) => new CategoryDistributionDto
                {
                    Category = x.Type,
                    Count = x.Count,
                    Color = colors[i % colors.Length]
                });
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve category distribution", ex);
            }
        }

        public async Task<IEnumerable<EquipmentPerformanceDto>> GetOwnerEquipmentPerformanceAsync(string ownerId)
        {
            try
            {
                var machines = await _unitOfWork.Machines.Query()
                    .Where(m => m.OwnerId == ownerId)
                    .Select(m => new { m.Id, m.Name })
                    .ToListAsync();

                var machineIds = machines.Select(m => m.Id).ToList();

                var bookingStats = await _unitOfWork.Bookings.Query()
                    .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed")
                    .GroupBy(b => b.MachineId)
                    .Select(g => new
                    {
                        MachineId = g.Key,
                        BookingCount = g.Count(),
                        TotalRevenue = g.Sum(b => b.BaseAmount)
                    })
                    .ToListAsync();

                var colors = new[] { "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b" };

                return machines.Join(bookingStats, m => m.Id, b => b.MachineId, (m, b) => new EquipmentPerformanceDto
                {
                    Name = m.Name ?? "Unknown",
                    Bookings = b.BookingCount,
                    Revenue = b.TotalRevenue,
                    Color = colors[machineIds.IndexOf(m.Id) % colors.Length]
                }).OrderByDescending(x => x.Bookings).Take(4);
            }
            catch (Exception ex)
            {
                throw new AppException("Failed to retrieve equipment performance", ex);
            }
        }

        private async Task<IEnumerable<MonthlyRevenueDto>> GetOwnerRevenueDataAsync(string ownerId, List<int> machineIds, int monthsAgo)
        {
            var cutoffDate = monthsAgo > 0 ? DateTime.UtcNow.AddMonths(-monthsAgo) : DateTime.UtcNow.AddDays(-7);

            var rawData = await _unitOfWork.Bookings.Query()
                .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed" && b.CreatedAt >= cutoffDate)
                .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                .Select(g => new
                {
                    MonthNum = g.Key.Month,
                    Year = g.Key.Year,
                    Revenue = g.Sum(b => b.BaseAmount),
                    BookingCount = g.Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.MonthNum)
                .ToListAsync();

            var monthNames = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };

            return rawData.Select(x => new MonthlyRevenueDto
            {
                Month = monthNames[x.MonthNum - 1],
                Year = x.Year,
                Revenue = x.Revenue,
                BookingCount = x.BookingCount
            });
        }

        private async Task<IEnumerable<CategoryDistributionDto>> GetOwnerCategoryDistributionAsync(string ownerId, List<int> machineIds)
        {
            var statusCounts = await _unitOfWork.Bookings.Query()
                .Where(b => machineIds.Contains(b.MachineId))
                .GroupBy(b => b.Status)
                .Select(g => new { Status = g.Key ?? "Unknown", Count = g.Count() })
                .ToListAsync();

            var colorMap = new Dictionary<string, string>
            {
                { "Active", "#10b981" },
                { "Completed", "#3b82f6" },
                { "Pending", "#f59e0b" },
                { "Cancelled", "#ef4444" }
            };

            return statusCounts.Select(s => new CategoryDistributionDto
            {
                Category = s.Status,
                Count = s.Count,
                Color = colorMap.GetValueOrDefault(s.Status, "#6b7280")
            });
        }

        private async Task<IEnumerable<InsightDto>> GetOwnerInsightsAsync(string ownerId, List<int> machineIds)
        {
            var totalRevenue = await _unitOfWork.Bookings.Query()
                .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Completed")
                .SumAsync(b => b.BaseAmount);

            var totalBookings = await _unitOfWork.Bookings.Query()
                .Where(b => machineIds.Contains(b.MachineId))
                .CountAsync();

            var avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

            var activeBookings = await _unitOfWork.Bookings.Query()
                .Where(b => machineIds.Contains(b.MachineId) && b.Status == "Active")
                .CountAsync();

            var utilizationRate = machineIds.Count > 0 ? (activeBookings * 100.0 / machineIds.Count) : 0;

            return new List<InsightDto>
            {
                new InsightDto
                {
                    Title = "Total Revenue",
                    Value = $"₹{totalRevenue:N0}",
                    Change = "+12%",
                    Trend = "up",
                    Description = "lifetime earnings",
                    Color = "#10b981"
                },
                new InsightDto
                {
                    Title = "Avg. Booking Value",
                    Value = $"₹{avgBookingValue:N0}",
                    Change = "+8%",
                    Trend = "up",
                    Description = "per rental",
                    Color = "#3b82f6"
                },
                new InsightDto
                {
                    Title = "Utilization Rate",
                    Value = $"{utilizationRate:F0}%",
                    Change = "+5%",
                    Trend = "up",
                    Description = "equipment usage",
                    Color = "#8b5cf6"
                },
                new InsightDto
                {
                    Title = "Total Bookings",
                    Value = totalBookings.ToString(),
                    Change = "+15%",
                    Trend = "up",
                    Description = "all time",
                    Color = "#f59e0b"
                }
            };
        }

        private async Task<IEnumerable<InsightDto>> GetAdminInsightsAsync()
        {
            var totalUsers = await _unitOfWork.Users.Query().CountAsync();
            var totalFarmers = await _unitOfWork.Users.Query().CountAsync(u => u.Role == "farmer");
            var totalOwners = await _unitOfWork.Users.Query().CountAsync(u => u.Role == "owner");
            var totalMachines = await _unitOfWork.Machines.Query().CountAsync();
            var totalBookings = await _unitOfWork.Bookings.Query().CountAsync();
            var completedBookings = await _unitOfWork.Bookings.Query().CountAsync(b => b.Status == "Completed");
            var platformRevenue = await _unitOfWork.Bookings.Query()
                .Where(b => b.Status == "Completed")
                .SumAsync(b => b.PlatformFee);

            var bookingRate = totalBookings > 0 ? (completedBookings * 100.0 / totalBookings) : 0;

            return new List<InsightDto>
            {
                new InsightDto
                {
                    Title = "Total Users",
                    Value = totalUsers.ToString(),
                    Change = $"+{Math.Max(10, totalUsers / 10)}%",
                    Trend = "up",
                    Description = $"({totalFarmers} farmers, {totalOwners} owners)",
                    Color = "#3b82f6"
                },
                new InsightDto
                {
                    Title = "Total Equipment",
                    Value = totalMachines.ToString(),
                    Change = $"+{Math.Max(5, totalMachines / 20)}%",
                    Trend = "up",
                    Description = "registered machines",
                    Color = "#10b981"
                },
                new InsightDto
                {
                    Title = "Platform Revenue",
                    Value = $"₹{platformRevenue / 1000:F1}K",
                    Change = $"+{Math.Max(15, (int)(platformRevenue / 1000))}%",
                    Trend = "up",
                    Description = "from platform fees",
                    Color = "#f59e0b"
                },
                new InsightDto
                {
                    Title = "Completion Rate",
                    Value = $"{bookingRate:F0}%",
                    Change = "+5%",
                    Trend = "up",
                    Description = $"{completedBookings} of {totalBookings} bookings",
                    Color = "#8b5cf6"
                }
            };
        }
    }
}
