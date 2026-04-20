using FEDomain;
using FEDomain.Interfaces;
using FEDomain.Data;

namespace FERepositories.Persistence
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        
        public IUserRepository Users { get; }
        public IMachineRepository Machines { get; }
        public IBookingRepository Bookings { get; }
        public INotificationRepository Notifications { get; }
        public IGenericRepository<Payment> Payments { get; }
        public IGenericRepository<SystemSetting> SystemSettings { get; }

        public UnitOfWork(ApplicationDbContext context)
        {
            _context = context;
            Users = new UserRepository(_context);
            Machines = new MachineRepository(_context);
            Bookings = new BookingRepository(_context);
            Notifications = new NotificationRepository(_context);
            Payments = new GenericRepository<Payment>(_context);
            SystemSettings = new GenericRepository<SystemSetting>(_context);
        }

        public async Task<int> SaveChangesAsync()
        {
            return await _context.SaveChangesAsync();
        }

        public int SaveChanges()
        {
            return _context.SaveChanges();
        }

        public void Dispose()
        {
            _context.Dispose();
        }
    }
}
