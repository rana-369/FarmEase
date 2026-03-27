using FEDomain.Interfaces;
using FEDomain;

namespace FERepositories
{
    public class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
    {
        public UserRepository(ApplicationDbContext context) : base(context) { }
    }

    public class MachineRepository : GenericRepository<Machine>, IMachineRepository
    {
        public MachineRepository(ApplicationDbContext context) : base(context) { }
    }

    public class BookingRepository : GenericRepository<Booking>, IBookingRepository
    {
        public BookingRepository(ApplicationDbContext context) : base(context) { }
    }

    public class NotificationRepository : GenericRepository<Notification>, INotificationRepository
    {
        public NotificationRepository(ApplicationDbContext context) : base(context) { }
    }
}