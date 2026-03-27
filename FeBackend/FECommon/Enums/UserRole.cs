namespace FECommon.Enums
{
    /// <summary>
    /// User roles for the FarmEase application
    /// </summary>
    public enum UserRole
    {
        Farmer = 1,
        Owner = 2,
        Admin = 3
    }

    /// <summary>
    /// Extension methods for UserRole enum
    /// </summary>
    public static class UserRoleExtensions
    {
        public static string ToLowerString(this UserRole role)
        {
            return role.ToString().ToLower();
        }

        public static UserRole FromString(string roleString)
        {
            if (string.IsNullOrEmpty(roleString))
                return UserRole.Farmer;

            return roleString.ToLower() switch
            {
                "farmer" => UserRole.Farmer,
                "owner" => UserRole.Owner,
                "admin" => UserRole.Admin,
                _ => UserRole.Farmer
            };
        }
    }
}
