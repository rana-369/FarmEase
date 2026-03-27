namespace FECommon.Enums
{
    /// <summary>
    /// Types of notifications in the system
    /// </summary>
    public enum NotificationType
    {
        Info = 0,
        Success = 1,
        Warning = 2,
        Error = 3,
        Booking = 4,
        Payment = 5,
        System = 6
    }

    /// <summary>
    /// Extension methods for NotificationType enum
    /// </summary>
    public static class NotificationTypeExtensions
    {
        public static string ToLowerString(this NotificationType type)
        {
            return type.ToString().ToLower();
        }

        public static NotificationType FromString(string typeString)
        {
            if (string.IsNullOrEmpty(typeString))
                return NotificationType.Info;

            return typeString.ToLower() switch
            {
                "info" => NotificationType.Info,
                "success" => NotificationType.Success,
                "warning" => NotificationType.Warning,
                "error" => NotificationType.Error,
                "booking" => NotificationType.Booking,
                "payment" => NotificationType.Payment,
                "system" => NotificationType.System,
                _ => NotificationType.Info
            };
        }
    }
}
