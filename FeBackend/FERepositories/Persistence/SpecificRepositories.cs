using FEDomain.Interfaces;
using FEDomain;
using FECommon.Enums;
using Microsoft.EntityFrameworkCore;

namespace FERepositories
{
    public class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<ApplicationUser>> GetByRoleAsync(string role)
            => await _dbSet.Where(u => u.Role == role).ToListAsync();

        public async Task<IEnumerable<ApplicationUser>> GetOwnersAsync()
            => await _dbSet.Where(u => u.Role == "owner").ToListAsync();

        public async Task<IEnumerable<ApplicationUser>> GetFarmersAsync()
            => await _dbSet.Where(u => u.Role == "farmer").ToListAsync();

        public async Task<ApplicationUser?> GetByEmailAsync(string email)
            => await _dbSet.FirstOrDefaultAsync(u => u.Email == email);
    }

    public class MachineRepository : GenericRepository<Machine>, IMachineRepository
    {
        public MachineRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Machine>> GetActiveAsync()
            => await _dbSet.Where(m => m.Status == "Active" || m.Status == "Verified").ToListAsync();

        public async Task<IEnumerable<Machine>> GetPendingAsync()
            => await _dbSet.Where(m => m.Status == "Pending Verification" || m.Status == "Pending").ToListAsync();

        public async Task<IEnumerable<Machine>> GetByOwnerAsync(string ownerId)
            => await _dbSet.Where(m => m.OwnerId == ownerId).OrderByDescending(m => m.CreatedAt).ToListAsync();

        public async Task<IEnumerable<Machine>> GetVerifiedAsync()
            => await _dbSet.Where(m => m.Status == "Verified" || m.Status == "Active").ToListAsync();
    }

    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Booking>> GetByOwnerAsync(string ownerId)
            => await _dbSet.Where(b => b.OwnerId == ownerId).OrderByDescending(b => b.CreatedAt).ToListAsync();

        public async Task<IEnumerable<Booking>> GetByFarmerAsync(string farmerId)
            => await _dbSet.Where(b => b.FarmerId == farmerId).OrderByDescending(b => b.CreatedAt).ToListAsync();

        public async Task<IEnumerable<Booking>> GetCompletedAsync()
            => await _dbSet.Where(b => b.Status == "Completed").ToListAsync();

        public async Task<IEnumerable<Booking>> GetActiveAsync()
            => await _dbSet.Where(b => b.Status == "Active").ToListAsync();

        public async Task<IEnumerable<Booking>> GetPendingAsync()
            => await _dbSet.Where(b => b.Status == "Pending" || b.Status == "PendingOwnerApproval").ToListAsync();

        public async Task<IEnumerable<Booking>> GetByMachineIdAsync(int machineId)
            => await _dbSet.Where(b => b.MachineId == machineId).ToListAsync();
    }

    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(ApplicationDbContext context) : base(context) { }

        public async Task<IEnumerable<Notification>> GetUnreadByUserAsync(string userId)
            => await _dbSet.Where(n => n.UserId == userId && !n.IsRead).OrderByDescending(n => n.CreatedAt).ToListAsync();

        public async Task MarkAsReadAsync(int notificationId)
        {
            var notification = await _dbSet.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                _dbSet.Update(notification);
            }
        }
    }
}