namespace UserServices.Impl.Models
{
    public class JwtSettings
    {
        public string? Secret { get; set; } // Secret key for signing the token
        public int ExpirationInMinutes { get; set; } // Token expiration time in minutes
        public string? Issuer { get; set; } // Issuer of the token
    }
}