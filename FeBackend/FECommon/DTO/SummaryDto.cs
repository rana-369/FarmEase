namespace FECommon.DTO
{
    /// <summary>
    /// Summary DTO for farmer listing
    /// </summary>
    public record FarmerSummaryDto
    {
        public string Id { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Location { get; init; }
        public string? ProfileImageUrl { get; init; }
        public string? PhoneNumber { get; init; }
        public DateTime CreatedAt { get; init; }
    }

    /// <summary>
    /// Summary DTO for owner listing
    /// </summary>
    public record OwnerSummaryDto
    {
        public string Id { get; init; } = string.Empty;
        public string FullName { get; init; } = string.Empty;
        public string Email { get; init; } = string.Empty;
        public string? Location { get; init; }
        public string? ProfileImageUrl { get; init; }
        public string? PhoneNumber { get; init; }
        public DateTime CreatedAt { get; init; }
        public int MachineCount { get; init; }
    }

    /// <summary>
    /// Dashboard statistics for owner
    /// </summary>
    public record OwnerDashboardStatsDto
    {
        public int TotalMachines { get; init; }
        public int ActiveBookings { get; init; }
        public int CompletedBookings { get; init; }
        public decimal TotalRevenue { get; init; }
        public decimal PlatformFeesEarned { get; init; }
        public int PendingBookings { get; init; }
    }

    /// <summary>
    /// Dashboard statistics for farmer
    /// </summary>
    public record FarmerDashboardStatsDto
    {
        public int TotalBookings { get; init; }
        public int ActiveBookings { get; init; }
        public int CompletedBookings { get; init; }
        public decimal TotalSpent { get; init; }
        public int PendingBookings { get; init; }
    }

    /// <summary>
    /// Dashboard statistics for admin
    /// </summary>
    public record AdminDashboardStatsDto
    {
        public int TotalUsers { get; init; }
        public int TotalFarmers { get; init; }
        public int TotalOwners { get; init; }
        public int TotalMachines { get; init; }
        public int TotalBookings { get; init; }
        public int ActiveBookings { get; init; }
        public int CompletedBookings { get; init; }
        public decimal TotalRevenue { get; init; }
        public decimal PlatformRevenue { get; init; }
        public List<RecentBookingDto> RecentBookings { get; init; } = [];
    }

    /// <summary>
    /// Recent booking summary for dashboard
    /// </summary>
    public record RecentBookingDto
    {
        public int Id { get; init; }
        public string MachineName { get; init; } = string.Empty;
        public string FarmerName { get; init; } = string.Empty;
        public string OwnerName { get; init; } = string.Empty;
        public string Status { get; init; } = string.Empty;
        public decimal TotalAmount { get; init; }
        public DateTime CreatedAt { get; init; }
    }

    /// <summary>
    /// Monthly revenue data point
    /// </summary>
    public record MonthlyRevenueDto
    {
        public string Month { get; init; } = string.Empty;
        public int Year { get; init; }
        public decimal Revenue { get; init; }
        public int BookingCount { get; init; }
    }

    /// <summary>
    /// Booking summary for list views
    /// </summary>
    public record BookingSummaryDto
    {
        public int Id { get; init; }
        public int MachineId { get; init; }
        public string MachineName { get; init; } = string.Empty;
        public string FarmerId { get; init; } = string.Empty;
        public string FarmerName { get; init; } = string.Empty;
        public string OwnerId { get; init; } = string.Empty;
        public string OwnerName { get; init; } = string.Empty;
        public string? Location { get; init; }
        public int Hours { get; init; }
        public DateTime? ScheduledDate { get; init; }
        public string? ScheduledTime { get; init; }
        public decimal BaseAmount { get; init; }
        public decimal PlatformFee { get; init; }
        public decimal TotalAmount { get; init; }
        public string Status { get; init; } = string.Empty;
        public DateTime CreatedAt { get; init; }
        public bool IsRefunded { get; init; }
        public bool IsPaid { get; init; }

        // OTP fields for farmer to see
        public string? ArrivalOtp { get; init; }
        public string? WorkStartOtp { get; init; }
    }

    /// <summary>
    /// Machine summary for list views
    /// </summary>
    public record MachineSummaryDto
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public string Type { get; init; } = string.Empty;
        public decimal Rate { get; init; }
        public string Status { get; init; } = string.Empty;
        public string? ImageUrl { get; init; }
        public DateTime CreatedAt { get; init; }
        public string? Location { get; init; }
        public string? Description { get; init; }
        public string OwnerId { get; init; } = string.Empty;
        public string OwnerName { get; init; } = string.Empty;
        public string? OwnerLocation { get; init; }
    }

    /// <summary>
    /// Analytics data for owner dashboard
    /// </summary>
    public record OwnerAnalyticsDto
    {
        public List<MonthlyRevenueDto> RevenueData { get; init; } = [];
        public List<EquipmentPerformanceDto> EquipmentPerformance { get; init; } = [];
        public List<CategoryDistributionDto> CategoryDistribution { get; init; } = [];
        public List<InsightDto> Insights { get; init; } = [];
    }

    /// <summary>
    /// Analytics data for admin dashboard
    /// </summary>
    public record AdminAnalyticsDto
    {
        public List<MonthlyRevenueDto> RevenueData { get; init; } = [];
        public List<UserGrowthDto> UserGrowth { get; init; } = [];
        public List<BookingTrendDto> BookingTrends { get; init; } = [];
        public List<CategoryDistributionDto> CategoryDistribution { get; init; } = [];
        public List<InsightDto> Insights { get; init; } = [];
    }

    /// <summary>
    /// Equipment performance data
    /// </summary>
    public record EquipmentPerformanceDto
    {
        public string Name { get; init; } = string.Empty;
        public int Bookings { get; init; }
        public decimal Revenue { get; init; }
        public string? Color { get; init; }
    }

    /// <summary>
    /// Category distribution data
    /// </summary>
    public record CategoryDistributionDto
    {
        public string Category { get; init; } = string.Empty;
        public int Count { get; init; }
        public string? Color { get; init; }
    }

    /// <summary>
    /// User growth data
    /// </summary>
    public record UserGrowthDto
    {
        public string Month { get; init; } = string.Empty;
        public int Farmers { get; init; }
        public int Owners { get; init; }
        public int Total { get; init; }
    }

    /// <summary>
    /// Booking trend data
    /// </summary>
    public record BookingTrendDto
    {
        public string Month { get; init; } = string.Empty;
        public int Bookings { get; init; }
        public string? Color { get; init; }
    }

    /// <summary>
    /// Insight card data
    /// </summary>
    public record InsightDto
    {
        public string Title { get; init; } = string.Empty;
        public string Value { get; init; } = string.Empty;
        public string Change { get; init; } = string.Empty;
        public string Trend { get; init; } = string.Empty;
        public string Description { get; init; } = string.Empty;
        public string Color { get; init; } = string.Empty;
    }
}
