namespace FECommon.Constants
{
    /// <summary>
    /// Constants for booking status values
    /// </summary>
    public static class BookingStatus
    {
        public const string Pending = "Pending";
        public const string Accepted = "Accepted";
        public const string Active = "Active";
        public const string Completed = "Completed";
        public const string Cancelled = "Cancelled";
        public const string Rejected = "Rejected";
        public const string PendingOwnerApproval = "Pending Owner Approval";
    }

    /// <summary>
    /// Constants for machine status values
    /// </summary>
    public static class MachineStatus
    {
        public const string Active = "Active";
        public const string Inactive = "Inactive";
        public const string Pending = "Pending";
        public const string PendingVerification = "Pending Verification";
    }

    /// <summary>
    /// Constants for payment status values
    /// </summary>
    public static class PaymentStatus
    {
        public const string Pending = "Pending";
        public const string Captured = "Captured";
        public const string Refunded = "Refunded";
        public const string Failed = "Failed";
    }

    /// <summary>
    /// Constants for user roles
    /// </summary>
    public static class UserRoles
    {
        public const string Admin = "admin";
        public const string Owner = "owner";
        public const string Farmer = "farmer";
        
        // Display versions (capitalized)
        public const string AdminDisplay = "Admin";
        public const string OwnerDisplay = "Owner";
        public const string FarmerDisplay = "Farmer";
    }

    /// <summary>
    /// Constants for notification types
    /// </summary>
    public static class NotificationType
    {
        public const string Info = "info";
        public const string Success = "success";
        public const string Warning = "warning";
        public const string Error = "error";
    }

    /// <summary>
    /// Constants for two-factor authentication methods
    /// </summary>
    public static class TwoFactorMethod
    {
        public const string Email = "email";
        public const string Authenticator = "authenticator";
    }
}
