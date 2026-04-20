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

        public BookingService(IUnitOfWork unitOfWork, IPaymentService paymentService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _paymentService = paymentService;
            _configuration = configuration;
            
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

                // Map data to DTO using denormalized fields
                var result = bookings.Select(b =>
                {
                    var isRefunded = refundedBookingIds.Contains(b.Id);

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
                        IsRefunded = isRefunded
                    };
                }).ToList();

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
                        result.Add(new BookingSummaryDto
                        {
                            Id = b.Id,
                            MachineId = b.MachineId,
                            MachineName = b.MachineName ?? "Unknown",
                            FarmerId = b.FarmerId,
                            FarmerName = b.FarmerName ?? "Unknown",
                            OwnerId = b.OwnerId,
                            OwnerName = "Owner",
                            Location = "",
                            Hours = b.Hours,
                            BaseAmount = b.BaseAmount,
                            PlatformFee = b.PlatformFee,
                            TotalAmount = b.TotalAmount,
                            Status = b.Status,
                            CreatedAt = b.CreatedAt,
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
    }
}
