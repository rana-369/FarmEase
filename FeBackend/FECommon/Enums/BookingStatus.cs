namespace FECommon.Enums
{
    /// <summary>
    /// Status of a booking/rental
    /// </summary>
    public enum BookingStatus
    {
        Pending = 0,
        Confirmed = 1,
        InProgress = 2,
        Completed = 3,
        Cancelled = 4,
        Rejected = 5
    }

    /// <summary>
    /// Extension methods for BookingStatus enum
    /// </summary>
    public static class BookingStatusExtensions
    {
        public static string ToDisplayString(this BookingStatus status)
        {
            return status switch
            {
                BookingStatus.Pending => "Pending",
                BookingStatus.Confirmed => "Confirmed",
                BookingStatus.InProgress => "In Progress",
                BookingStatus.Completed => "Completed",
                BookingStatus.Cancelled => "Cancelled",
                BookingStatus.Rejected => "Rejected",
                _ => "Unknown"
            };
        }

        public static BookingStatus FromString(string statusString)
        {
            if (string.IsNullOrEmpty(statusString))
                return BookingStatus.Pending;

            return statusString.ToLower().Replace(" ", "") switch
            {
                "pending" => BookingStatus.Pending,
                "confirmed" => BookingStatus.Confirmed,
                "inprogress" => BookingStatus.InProgress,
                "completed" => BookingStatus.Completed,
                "cancelled" => BookingStatus.Cancelled,
                "rejected" => BookingStatus.Rejected,
                _ => BookingStatus.Pending
            };
        }
    }
}
