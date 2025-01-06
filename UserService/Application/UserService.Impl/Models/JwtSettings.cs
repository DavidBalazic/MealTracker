namespace UserServices.Impl.Models
{
  public class JwtSettings
  {
    public string? Secret { get; set; }
    public int ExpirationInMinutes { get; set; }
  }
}