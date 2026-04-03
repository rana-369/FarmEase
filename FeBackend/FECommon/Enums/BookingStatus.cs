namespace FECommon.Enums
{
    /// <summary>
    /// Status of a booking/rental
    /// </summary>
    public enum BookingStatus
    {
        Pending = 0,
        PendingOwnerApproval = 1,
        Accepted = 2,
        Confirmed = 3,
        InProgress = 4,
        Active = 5,
        Completed = 6,
        Cancelled = 7,
        Rejected = 8
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
                BookingStatus.PendingOwnerApproval => "Pending Owner Approval",
                BookingStatus.Accepted => "Accepted",
                BookingStatus.Confirmed => "Confirmed",
                BookingStatus.InProgress => "In Progress",
                BookingStatus.Active => "Active",
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

            // Remove spaces efficiently and parse ignoring case (no extra string allocations)
            var cleanString = statusString.Replace(" ", "").Trim();
            
            // Handle common variations
            return cleanString.ToLower() switch
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
                _ => BookingStatus.Pending // Default fallback for unknown values
            };
        }
    }
}
