using FEDomain;
using FEDomain.Interfaces;
using FEDTO.DTOs;
using FEServices.Interface;
using FECommon.DTO;

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

        public async Task<IEnumerable<Booking>> GetAllBookingsAsync()
        {
            return await _unitOfWork.Bookings.GetAllAsync();
        }

        public async Task<PagedResult<object>> GetAllBookingsPagedAsync(int page, int limit, string? search, string? status)
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var allMachines = await _unitOfWork.Machines.GetAllAsync();
            var allUsers = await _unitOfWork.Users.GetAllAsync();
            var allPayments = (await _unitOfWork.Payments.GetAllAsync()).ToList();
            
            // Get booking IDs that have been refunded
            var refundedBookingIds = allPayments
                .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                .Select(p => p.BookingId)
                .ToHashSet();
            
            // Calculate summary stats from ALL bookings first (before filtering)
            var activeCount = allBookings.Count(b => b.Status?.ToLower() == "active");
            var completedCount = allBookings.Count(b => b.Status?.ToLower() == "completed" && !refundedBookingIds.Contains(b.Id));
            var platformRevenue = allBookings
                .Where(b => b.Status?.ToLower() == "completed" && !refundedBookingIds.Contains(b.Id))
                .Sum(b => b.PlatformFee);
            
            // Join bookings with machines and users
            var bookingsWithDetails = allBookings.Select(b =>
            {
                var machine = allMachines.FirstOrDefault(m => m.Id == b.MachineId);
                var farmer = allUsers.FirstOrDefault(u => string.Equals(u.Id, b.FarmerId, StringComparison.OrdinalIgnoreCase));
                var owner = allUsers.FirstOrDefault(u => string.Equals(u.Id, b.OwnerId, StringComparison.OrdinalIgnoreCase));
                var isRefunded = refundedBookingIds.Contains(b.Id);
                
                return new
                {
                    b.Id,
                    b.MachineId,
                    MachineName = b.MachineName ?? machine?.Name ?? "Unknown",
                    b.FarmerId,
                    FarmerName = b.FarmerName ?? farmer?.FullName ?? "Unknown",
                    b.OwnerId,
                    OwnerName = owner?.FullName ?? "Unknown",
                    Location = machine?.Location ?? owner?.Location ?? "",
                    b.Hours,
                    b.BaseAmount,
                    b.PlatformFee,
                    b.TotalAmount,
                    b.Status,
                    b.CreatedAt,
                    IsRefunded = isRefunded
                };
            }).AsEnumerable();
            
            // Apply filters
            if (!string.IsNullOrEmpty(search))
            {
                bookingsWithDetails = bookingsWithDetails.Where(b => 
                    (b.MachineName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (b.FarmerName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false) ||
                    (b.OwnerName?.Contains(search, StringComparison.OrdinalIgnoreCase) ?? false));
            }
            
            if (!string.IsNullOrEmpty(status) && status.ToLower() != "all")
            {
                bookingsWithDetails = bookingsWithDetails.Where(b => 
                    b.Status?.Equals(status, StringComparison.OrdinalIgnoreCase) ?? false);
            }
            
            // Get total count after filtering
            var totalItems = bookingsWithDetails.Count();
            
            // Apply pagination
            var pagedBookings = bookingsWithDetails
                .OrderByDescending(b => b.CreatedAt)
                .Skip((page - 1) * limit)
                .Take(limit)
                .ToList();
            
            return new PagedResult<object>(pagedBookings.Cast<object>().ToList(), totalItems, page, limit)
            {
                Summary = new
                {
                    ActiveCount = activeCount,
                    CompletedCount = completedCount,
                    TotalRevenue = platformRevenue
                }
            };
        }

        public async Task<IEnumerable<Booking>> GetOwnerBookingsAsync(string ownerId)
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            return allBookings
                .Where(b => string.Equals(b.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(b => b.CreatedAt);
        }

        public async Task<IEnumerable<object>> GetFarmerBookingsAsync(string farmerId)
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var allPayments = await _unitOfWork.Payments.GetAllAsync();
            
            var farmerBookings = allBookings
                .Where(b => string.Equals(b.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(b => b.CreatedAt)
                .Select(b => {
                    var payment = allPayments.FirstOrDefault(p => p.BookingId == b.Id);
                    return new {
                        b.Id,
                        b.MachineId,
                        b.MachineName,
                        b.FarmerId,
                        b.FarmerName,
                        b.OwnerId,
                        b.Hours,
                        b.BaseAmount,
                        b.PlatformFee,
                        b.TotalAmount,
                        b.Status,
                        b.CreatedAt,
                        IsPaid = payment != null && payment.Status == "Captured",
                        Payment = payment != null ? new {
                            payment.Id,
                            payment.RazorpayPaymentId,
                            payment.Status,
                            payment.Amount,
                            payment.CreatedAt,
                            payment.RefundAmount,
                            payment.RefundId,
                            payment.RefundedAt,
                            payment.RefundReason
                        } : null
                    };
                })
                .ToList();
            
            return farmerBookings.Cast<object>();
        }

        public async Task<Booking?> GetByIdAsync(int id)
        {
            return await _unitOfWork.Bookings.GetByIdAsync(id);
        }

        public async Task<(bool Success, string Message, Booking? Booking)> CreateAsync(CreateBookingDto request, string farmerId, string farmerName)
        {
            var machine = await _unitOfWork.Machines.GetByIdAsync(request.MachineId);

            if (machine == null || machine.Status != "Active")
                return (false, "Invalid or unavailable machine.", null);

            int safeHours = request.Hours > 0 ? request.Hours : 1;
            var rate = machine.Rate > 0 ? machine.Rate : 1;

            var booking = new Booking
            {
                MachineId = machine.Id,
                MachineName = machine.Name,
                FarmerId = farmerId,
                FarmerName = farmerName,
                OwnerId = machine.OwnerId,
                Hours = safeHours,
                BaseAmount = rate * safeHours,
                PlatformFee = (rate * safeHours) * 0.10m,
                TotalAmount = (rate * safeHours) * 1.10m,
                Status = "Pending",
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

        public async Task<(bool Success, string Message)> AcceptAsync(int id, string ownerId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
            if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                return (false, "Unauthorized or booking not found.");

            booking.Status = "Accepted";
            _unitOfWork.Bookings.Update(booking);

            var notification = new Notification
            {
                UserId = booking.FarmerId,
                Title = "Booking Accepted",
                Message = $"Your request for {booking.MachineName} was ACCEPTED!",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Booking accepted!");
        }

        public async Task<(bool Success, string Message)> RejectAsync(int id, string ownerId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
            if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                return (false, "Unauthorized or booking not found.");

            booking.Status = "Rejected";
            _unitOfWork.Bookings.Update(booking);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Booking rejected.");
        }

        public async Task<(bool Success, string Message)> CompleteAsync(int id, string ownerId)
        {
            var booking = await _unitOfWork.Bookings.GetByIdAsync(id);
            if (booking == null || !string.Equals(booking.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                return (false, "Unauthorized or booking not found.");

            booking.Status = "Completed";
            _unitOfWork.Bookings.Update(booking);

            var notification = new Notification
            {
                UserId = booking.FarmerId,
                Title = "Booking Completed",
                Message = $"The job for {booking.MachineName} has been marked as COMPLETED.",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Booking completed!");
        }

        public async Task<(bool Success, string Message)> CancelAsync(int id, string farmerId)
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
                var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                if (!success)
                    return (false, $"Failed to process refund: {message}");
                
                return (true, "Booking cancelled and refund processed successfully.");
            }

            // Handle accepted bookings - check if payment exists
            if (booking.Status == "Accepted")
            {
                var payments = await _unitOfWork.Payments.GetAllAsync();
                var payment = payments.FirstOrDefault(p => p.BookingId == id && p.Status == "Captured");
                
                if (payment != null)
                {
                    // Payment was made, process refund
                    var (success, message, _) = await _paymentService.RefundAsync(id, "Cancelled by farmer");
                    if (!success)
                        return (false, $"Failed to process refund: {message}");
                    
                    return (true, "Booking cancelled and refund processed successfully.");
                }
                
                // No payment, just update status
                booking.Status = "Cancelled";
                _unitOfWork.Bookings.Update(booking);
                
                var notification = new Notification
                {
                    UserId = booking.OwnerId,
                    Title = "Booking Cancelled",
                    Message = $"Booking for {booking.MachineName} has been cancelled by the farmer.",
                    Type = "info",
                    IsRead = false,
                    CreatedAt = DateTime.UtcNow
                };
                await _unitOfWork.Notifications.AddAsync(notification);
                await _unitOfWork.SaveChangesAsync();
                
                return (true, "Booking cancelled.");
            }

            return (false, $"Cannot cancel booking with status '{booking.Status}'.");
        }

        public async Task<(bool Success, string Message)> PayAsync(int id, string farmerId)
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
                UserId = booking.OwnerId,
                Title = "Payment Received",
                Message = $"Payment successful! The rental for {booking.MachineName} is now ACTIVE.",
                Type = "success",
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Notifications.AddAsync(notification);
            await _unitOfWork.SaveChangesAsync();

            return (true, "Payment successful!");
        }

        public async Task<object> GetOwnerDashboardStatsAsync(string ownerId)
        {
            var allMachines = await _unitOfWork.Machines.GetAllAsync();
            var ownerMachines = allMachines
                .Where(m => string.Equals(m.OwnerId?.Trim(), ownerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .ToList();

            var machineIds = ownerMachines.Select(m => m.Id).ToList();

            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var payments = (await _unitOfWork.Payments.GetAllAsync()).ToList();
            var bookings = allBookings.Where(b => machineIds.Contains(b.MachineId)).ToList();

            // Get booking IDs that have been refunded
            var refundedBookingIds = payments
                .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                .Select(p => p.BookingId)
                .ToHashSet();

            // Only count earnings from completed bookings that haven't been refunded
            var earnings = bookings
                .Where(b => b.Status == "Completed" && !refundedBookingIds.Contains(b.Id))
                .Sum(b => b.TotalAmount - b.PlatformFee);

            var activeCount = bookings.Count(b => b.Status == "Active");
            var pendingCount = bookings.Count(b => b.Status == "Pending" || b.Status == "Pending Owner Approval");

            return new
            {
                totalMachines = ownerMachines.Count,
                totalEarnings = (double)earnings,
                activeRentals = activeCount,
                pendingRequests = pendingCount,
                lastSync = DateTime.UtcNow
            };
        }

        public async Task<object> GetFarmerStatsAsync(string farmerId)
        {
            var allBookings = await _unitOfWork.Bookings.GetAllAsync();
            var myBookings = allBookings
                .Where(b => string.Equals(b.FarmerId?.Trim(), farmerId?.Trim(), StringComparison.OrdinalIgnoreCase))
                .ToList();

            var totalBookings = myBookings.Count;
            var activeBookings = myBookings.Count(b => b.Status == "Accepted" || b.Status == "Pending");
            var completedBookings = myBookings.Count(b => b.Status == "Completed");
            var totalSpent = myBookings.Where(b => b.Status == "Completed").Sum(b => b.TotalAmount);

            return new
            {
                totalBookings,
                activeBookings,
                completedBookings,
                totalSpent
            };
        }

        public async Task<object> GetAdminStatsAsync()
        {
            var users = await _unitOfWork.Users.GetAllAsync();
            var machines = await _unitOfWork.Machines.GetAllAsync();
            var bookings = await _unitOfWork.Bookings.GetAllAsync();
            var payments = (await _unitOfWork.Payments.GetAllAsync()).ToList();

            Console.WriteLine($"[AdminStats] Total payments: {payments.Count}");
            foreach (var p in payments)
            {
                Console.WriteLine($"[AdminStats] Payment: Id={p.Id}, Status={p.Status}, RefundAmount={p.RefundAmount}");
            }

            var totalUsers = users.Count();
            var totalFarmers = users.Count(u => u.Role == "farmer");
            var totalOwners = users.Count(u => u.Role == "owner");

            var totalMachines = machines.Count();
            var pendingMachines = machines.Count(m => m.Status == "Pending Verification" || m.Status == "Pending");

            var totalBookings = bookings.Count();
            
            // Get booking IDs that have been refunded
            var refundedBookingIds = payments
                .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                .Select(p => p.BookingId)
                .ToHashSet();

            // Count only completed bookings that haven't been refunded
            var completedBookings = bookings
                .Where(b => b.Status == "Completed" && !refundedBookingIds.Contains(b.Id))
                .ToList();

            var totalTransactionValue = completedBookings.Sum(b => b.TotalAmount);
            var platformProfit = completedBookings.Sum(b => b.PlatformFee);

            Console.WriteLine($"[AdminStats] Completed bookings: {completedBookings.Count}, Refunded booking IDs: {string.Join(",", refundedBookingIds)}");
            Console.WriteLine($"[AdminStats] TotalTransactionValue: {totalTransactionValue}, PlatformProfit: {platformProfit}");

            var recentBookings = bookings
                .OrderByDescending(b => b.CreatedAt)
                .Take(5)
                .Select(b => new { b.Id, b.MachineName, b.FarmerName, b.TotalAmount, b.Status, b.CreatedAt });

            return new
            {
                Stats = new
                {
                    TotalUsers = totalUsers,
                    Farmers = totalFarmers,
                    Owners = totalOwners,
                    TotalMachines = totalMachines,
                    PendingApprovals = pendingMachines,
                    TotalBookings = totalBookings,
                    Revenue = platformProfit,
                    TotalTransactionValue = totalTransactionValue,
                    SuccessfulPayments = completedBookings.Count
                },
                RecentBookings = recentBookings
            };
        }

        public async Task<IEnumerable<object>> GetRevenueByMonthAsync()
        {
            var sixMonthsAgo = DateTime.UtcNow.AddMonths(-6);

            var bookings = await _unitOfWork.Bookings.GetAllAsync();
            var payments = (await _unitOfWork.Payments.GetAllAsync()).ToList();
            
            // Get booking IDs that have been refunded
            var refundedBookingIds = payments
                .Where(p => p.RefundAmount != null && p.RefundAmount > 0)
                .Select(p => p.BookingId)
                .ToHashSet();

            // Count only completed bookings that haven't been refunded
            var completedBookings = bookings
                .Where(b => b.Status == "Completed" && !refundedBookingIds.Contains(b.Id) && b.CreatedAt >= sixMonthsAgo)
                .ToList();

            var revenueByMonth = completedBookings
                .GroupBy(b => new { b.CreatedAt.Year, b.CreatedAt.Month })
                .Select(g => new
                {
                    Month = new DateTime(g.Key.Year, g.Key.Month, 1).ToString("MMM"),
                    Revenue = g.Sum(b => b.TotalAmount),
                    SortDate = new DateTime(g.Key.Year, g.Key.Month, 1)
                })
                .OrderBy(x => x.SortDate)
                .Select(x => new { x.Month, x.Revenue });

            if (!revenueByMonth.Any())
            {
                var months = new[] { "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" };
                var today = DateTime.UtcNow;
                var dummyData = new List<object>();
                for (int i = 5; i >= 0; i--)
                {
                    var targetDate = today.AddMonths(-i);
                    dummyData.Add(new { Month = months[targetDate.Month - 1], Revenue = 0m });
                }
                return dummyData;
            }

            return revenueByMonth;
        }
    }
}
