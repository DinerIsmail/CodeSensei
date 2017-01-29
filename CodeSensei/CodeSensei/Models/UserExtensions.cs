namespace CodeSensei.Models
{
    public static class UserExtensions
    {
        public static bool IsValidState(this User @this)
        {
            return !string.IsNullOrEmpty(@this.Email) && !string.IsNullOrEmpty(@this.Password) &&
                   !string.IsNullOrEmpty(@this.FirstName)
                   && !string.IsNullOrEmpty(@this.Surname);
        }
    }
}