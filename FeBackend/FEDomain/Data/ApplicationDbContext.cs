using FEDomain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace FERepositories
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Machine> Machines { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Payment> Payments { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Booking indexes and enum conversion
            modelBuilder.Entity<Booking>()
                .Property(b => b.Status)
                .HasConversion<string>()
                .HasDefaultValue(FECommon.Enums.BookingStatus.Pending);
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.Status)
                .HasDatabaseName("IX_Bookings_Status");
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.OwnerId)
                .HasDatabaseName("IX_Bookings_OwnerId");
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.FarmerId)
                .HasDatabaseName("IX_Bookings_FarmerId");
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.MachineId)
                .HasDatabaseName("IX_Bookings_MachineId");
            
            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.CreatedAt)
                .HasDatabaseName("IX_Bookings_CreatedAt");

            // Machine indexes
            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.Status)
                .HasDatabaseName("IX_Machines_Status");
            
            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.OwnerId)
                .HasDatabaseName("IX_Machines_OwnerId");
            
            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.CreatedAt)
                .HasDatabaseName("IX_Machines_CreatedAt");

            // Payment indexes
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.BookingId)
                .HasDatabaseName("IX_Payments_BookingId");
            
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.Status)
                .HasDatabaseName("IX_Payments_Status");

            // Notification indexes
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.UserId)
                .HasDatabaseName("IX_Notifications_UserId");
            
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.IsRead)
                .HasDatabaseName("IX_Notifications_IsRead");
            
            modelBuilder.Entity<Notification>()
                .HasIndex(n => n.CreatedAt)
                .HasDatabaseName("IX_Notifications_CreatedAt");

            // User indexes (ApplicationUser extends IdentityUser)
            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.Role)
                .HasDatabaseName("IX_Users_Role");
        }
    }
}