namespace FECommon.Enums
{
    /// <summary>
    /// Status of a machine/equipment
    /// </summary>
    public enum MachineStatus
    {
        PendingVerification = 0,
        Verified = 1,
        Active = 2,
        Rejected = 3,
        Maintenance = 4
    }

    /// <summary>
    /// Extension methods for MachineStatus enum
    /// </summary>
    public static class MachineStatusExtensions
    {
        public static string ToDisplayString(this MachineStatus status)
        {
            return status switch
            {
                MachineStatus.PendingVerification => "Pending Verification",
                MachineStatus.Verified => "Verified",
                MachineStatus.Active => "Active",
                MachineStatus.Rejected => "Rejected",
                MachineStatus.Maintenance => "Under Maintenance",
                _ => "Unknown"
            };
        }

        public static MachineStatus FromString(string statusString)
        {
            if (string.IsNullOrEmpty(statusString))
                return MachineStatus.PendingVerification;

            // Remove spaces efficiently and parse ignoring case (no extra string allocations)
            var cleanString = statusString.Replace(" ", "");
            
            // Handle "Pending" as alias for PendingVerification
            if (cleanString.Equals("Pending", StringComparison.OrdinalIgnoreCase))
                return MachineStatus.PendingVerification;
            
            if (Enum.TryParse<MachineStatus>(cleanString, true, out var status))
                return status;

            return MachineStatus.PendingVerification; // Default fallback
        }
    }
}
