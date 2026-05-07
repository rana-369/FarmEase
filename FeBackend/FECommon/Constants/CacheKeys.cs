namespace FECommon.Constants;

/// <summary>
/// Redis cache key constants for consistent key naming
/// </summary>
public static class CacheKeys
{
    // User-related cache keys
    public const string UserById = "user:{0}";
    public const string UserByEmail = "user:email:{0}";
    public const string UserByPhone = "user:phone:{0}";
    public const string UserProfile = "user:profile:{0}";
    public const string UserBookings = "user:bookings:{0}";
    public const string UserNotifications = "user:notifications:{0}";
    
    // Machine/Equipment cache keys
    public const string MachineById = "machine:{0}";
    public const string MachinesByOwner = "machines:owner:{0}";
    public const string MachinesByCity = "machines:city:{0}";
    public const string MachinesByCategory = "machines:category:{0}";
    public const string FeaturedMachines = "machines:featured";
    public const string MachineSearchResults = "machines:search:{0}";
    public const string NearbyMachines = "machines:nearby:{0}:{1}:{2}";
    
    // Booking cache keys
    public const string BookingById = "booking:{0}";
    public const string BookingsByFarmer = "bookings:farmer:{0}";
    public const string BookingsByOwner = "bookings:owner:{0}";
    public const string BookingsByMachine = "bookings:machine:{0}";
    public const string BookingStats = "bookings:stats:{0}";
    
    // Dashboard cache keys
    public const string AdminDashboardStats = "dashboard:admin:stats";
    public const string OwnerDashboardStats = "dashboard:owner:{0}";
    public const string FarmerDashboardStats = "dashboard:farmer:{0}";
    
    // Public data cache keys
    public const string ActiveCities = "public:cities";
    public const string Categories = "public:categories";
    public const string Testimonials = "public:testimonials";
    public const string PlatformStats = "public:stats";
    
    // Rate limiting cache keys
    public const string RateLimit = "ratelimit:{0}:{1}";
    public const string ApiUsage = "api:usage:{0}";
    
    // Session cache keys
    public const string UserSession = "session:{0}";
    public const string OtpAttempts = "otp:attempts:{0}";
    
    // Cache expiration times
    public static readonly TimeSpan ShortExpiration = TimeSpan.FromMinutes(5);
    public static readonly TimeSpan MediumExpiration = TimeSpan.FromMinutes(30);
    public static readonly TimeSpan LongExpiration = TimeSpan.FromHours(2);
    public static readonly TimeSpan DayExpiration = TimeSpan.FromHours(24);
    public static readonly TimeSpan WeekExpiration = TimeSpan.FromDays(7);
    
    /// <summary>
    /// Format cache key with parameters
    /// </summary>
    public static string Format(string key, params object[] args)
    {
        return string.Format(key, args);
    }
    
    /// <summary>
    /// Generate search cache key from parameters
    /// </summary>
    public static string GenerateSearchKey(string? search, string? category, string? city, int page, int limit)
    {
        return $"search:{search ?? "all"}:{category ?? "all"}:{city ?? "all"}:{page}:{limit}";
    }
}
