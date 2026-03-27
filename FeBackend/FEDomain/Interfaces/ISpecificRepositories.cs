// We don't need 'using FEDomain;' anymore because we are already inside it!

namespace FEDomain.Interfaces
{
    public interface IUserRepository : IGenericRepository<ApplicationUser> { }
    public interface IMachineRepository : IGenericRepository<Machine> { }
    public interface IBookingRepository : IGenericRepository<Booking> { }
    public interface INotificationRepository : IGenericRepository<Notification> { }
}