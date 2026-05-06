using FEDomain;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using FECommon.Enums;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace FEDomain.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<Machine> Machines { get; set; }
        public DbSet<SystemSetting> SystemSettings { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Payment> Payments { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Testimonial> Testimonials { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Booking indexes and enum conversion - store as string
            modelBuilder.Entity<Booking>()
                .Property(b => b.Status)
                .IsRequired()
                .HasMaxLength(50);
            
            modelBuilder.Entity<Booking>()
                .Property(b => b.MachineName)
                .IsRequired(false);
            
            modelBuilder.Entity<Booking>()
                .Property(b => b.FarmerName)
                .IsRequired(false);
            
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

            // Location-based search indexes
            modelBuilder.Entity<Machine>()
                .HasIndex(m => m.City)
                .HasDatabaseName("IX_Machines_City");

            modelBuilder.Entity<Machine>()
                .HasIndex(m => new { m.Latitude, m.Longitude })
                .HasDatabaseName("IX_Machines_Latitude_Longitude");

            // Payment indexes
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.BookingId)
                .HasDatabaseName("IX_Payments_BookingId");
            
            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.Status)
                .HasDatabaseName("IX_Payments_Status");

            modelBuilder.Entity<Payment>()
                .HasIndex(p => p.SettlementStatus)
                .HasDatabaseName("IX_Payments_SettlementStatus");

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

            // ApplicationUser Razorpay indexes
            modelBuilder.Entity<ApplicationUser>()
                .HasIndex(u => u.RazorpayAccountId)
                .HasDatabaseName("IX_Users_RazorpayAccountId")
                .HasFilter("[RazorpayAccountId] IS NOT NULL");

            // Review indexes
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.MachineId)
                .HasDatabaseName("IX_Reviews_MachineId");
            
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.FarmerId)
                .HasDatabaseName("IX_Reviews_FarmerId");
            
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.OwnerId)
                .HasDatabaseName("IX_Reviews_OwnerId");
            
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.BookingId)
                .IsUnique()
                .HasDatabaseName("IX_Reviews_BookingId_Unique");
            
            modelBuilder.Entity<Review>()
                .HasIndex(r => r.CreatedAt)
                .HasDatabaseName("IX_Reviews_CreatedAt");

            // Testimonial indexes
            modelBuilder.Entity<Testimonial>()
                .HasIndex(t => t.IsActive)
                .HasDatabaseName("IX_Testimonials_IsActive");
            
            modelBuilder.Entity<Testimonial>()
                .HasIndex(t => t.DisplayOrder)
                .HasDatabaseName("IX_Testimonials_DisplayOrder");
        }

        private static BookingStatus ParseBookingStatusSafe(string value)
        {
            if (string.IsNullOrWhiteSpace(value))
                return BookingStatus.Pending;

            return value.Trim().ToLower() switch
            {
                "pending" => BookingStatus.Pending,
                "pendingownerapproval" => BookingStatus.PendingOwnerApproval,
                "accepted" => BookingStatus.Accepted,
                "confirmed" => BookingStatus.Confirmed,
                "inprogress" => BookingStatus.InProgress,
                "active" => BookingStatus.Active,
                "completed" => BookingStatus.Completed,
                "cancelled" => BookingStatus.Cancelled,
                "rejected" => BookingStatus.Rejected,
                _ => BookingStatus.Pending // Fallback for unknown values
            };
        }
    }
}