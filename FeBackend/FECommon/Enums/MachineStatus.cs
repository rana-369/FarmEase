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

            return statusString.ToLower().Replace(" ", "") switch
            {
                "pendingverification" => MachineStatus.PendingVerification,
                "pending" => MachineStatus.PendingVerification,
                "verified" => MachineStatus.Verified,
                "active" => MachineStatus.Active,
                "rejected" => MachineStatus.Rejected,
                "maintenance" => MachineStatus.Maintenance,
                _ => MachineStatus.PendingVerification
            };
        }
    }
}
