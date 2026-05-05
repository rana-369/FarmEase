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
        Arrived = 4,           // Owner has arrived at location
        InProgress = 5,        // Work is in progress
        Completed = 6,         // Work completed, awaiting payment
        Paid = 7,              // Payment done after completion
        Cancelled = 8,
        Rejected = 9,
        Active = 10            // Legacy - kept for backward compatibility
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
                BookingStatus.Arrived => "Arrived",
                BookingStatus.InProgress => "In Progress",
                BookingStatus.Completed => "Completed",
                BookingStatus.Paid => "Paid",
                BookingStatus.Cancelled => "Cancelled",
                BookingStatus.Rejected => "Rejected",
                BookingStatus.Active => "Active",
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
                "arrived" => BookingStatus.Arrived,
                "inprogress" => BookingStatus.InProgress,
                "completed" => BookingStatus.Completed,
                "paid" => BookingStatus.Paid,
                "cancelled" => BookingStatus.Cancelled,
                "rejected" => BookingStatus.Rejected,
                "active" => BookingStatus.Active,
                _ => BookingStatus.Pending // Default fallback for unknown values
            };
        }
    }
}
