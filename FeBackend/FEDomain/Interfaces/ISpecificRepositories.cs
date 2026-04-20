using FEDomain;

namespace FEDomain.Interfaces
{
    public interface IUserRepository : IGenericRepository<ApplicationUser>
    {
        Task<IEnumerable<ApplicationUser>> GetByRoleAsync(string role);
        Task<IEnumerable<ApplicationUser>> GetOwnersAsync();
        Task<IEnumerable<ApplicationUser>> GetFarmersAsync();
        Task<ApplicationUser?> GetByEmailAsync(string email);
    }

    public interface IMachineRepository : IGenericRepository<Machine>
    {
        Task<IEnumerable<Machine>> GetActiveAsync();
        Task<IEnumerable<Machine>> GetPendingAsync();
        Task<IEnumerable<Machine>> GetByOwnerAsync(string ownerId);
        Task<IEnumerable<Machine>> GetVerifiedAsync();
    }

    public interface IBookingRepository : IGenericRepository<Booking>
    {
        Task<IEnumerable<Booking>> GetByOwnerAsync(string ownerId);
        Task<IEnumerable<Booking>> GetByFarmerAsync(string farmerId);
        Task<IEnumerable<Booking>> GetCompletedAsync();
        Task<IEnumerable<Booking>> GetActiveAsync();
        Task<IEnumerable<Booking>> GetPendingAsync();
        Task<IEnumerable<Booking>> GetByMachineIdAsync(int machineId);
    }

    public interface INotificationRepository : IGenericRepository<Notification>
    {
        Task<IEnumerable<Notification>> GetUnreadByUserAsync(string userId);
        Task MarkAsReadAsync(int notificationId);
    }
}