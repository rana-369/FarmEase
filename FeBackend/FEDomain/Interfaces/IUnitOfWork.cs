using FEDomain;

namespace FEDomain.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IUserRepository Users { get; }
        IMachineRepository Machines { get; }
        IBookingRepository Bookings { get; }
        INotificationRepository Notifications { get; }
        IGenericRepository<Payment> Payments { get; }
        IGenericRepository<SystemSetting> SystemSettings { get; }
        IReviewRepository Reviews { get; }
        IGenericRepository<Testimonial> Testimonials { get; }
        
        Task<int> SaveChangesAsync();
        int SaveChanges();
    }
}
