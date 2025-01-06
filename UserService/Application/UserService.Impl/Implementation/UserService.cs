using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserServices.Impl.DTOs;
using UserServices.Impl.Interfaces;
using UserServices.Impl.Models;

namespace UserServices.Impl.Implementation
{
  public class UserService : IUserService
  {
    private readonly IMongoCollection<UserModel> _users;
    private readonly JwtSettings _jwtSettings;

    public UserService(IMongoClient mongoClient, IConfiguration configuration)
    {
      var database = mongoClient.GetDatabase("UserServiceDB");
      _users = database.GetCollection<UserModel>("Users");

      _jwtSettings = configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
    }

    public async Task<string> RegisterUserAsync(RegisterDTO registerDto)
    {
      var existingUser = await _users.Find(u => u.Email == registerDto.Email).FirstOrDefaultAsync();
      if (existingUser != null)
      {
        throw new Exception("User already exists");
      }

      var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
      var newUser = new UserModel { Email = registerDto.Email, PasswordHash = passwordHash };
      await _users.InsertOneAsync(newUser);

      return newUser.Id;
    }

    public async Task<string> LoginUserAsync(LoginDTO loginDto)
    {
      var user = await _users.Find(u => u.Email == loginDto.Email).FirstOrDefaultAsync();
      if (user == null || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
      {
        throw new Exception("Invalid credentials");
      }

      return GenerateJwtToken(user);
    }

    public async Task UpdateUserAsync(UpdateDTO updateDto)
    {
      var update = Builders<UserModel>.Update;
      var updates = new List<UpdateDefinition<UserModel>>();

      if (!string.IsNullOrEmpty(updateDto.NewEmail))
      {
        updates.Add(update.Set(u => u.Email, updateDto.NewEmail));
      }

      if (!string.IsNullOrEmpty(updateDto.NewPassword))
      {
        var newPasswordHash = BCrypt.Net.BCrypt.HashPassword(updateDto.NewPassword);
        updates.Add(update.Set(u => u.PasswordHash, newPasswordHash));
      }

      if (updates.Count > 0)
      {
        await _users.UpdateOneAsync(
            u => u.Id == updateDto.UserId,
            update.Combine(updates)
        );
      }
    }
    public bool ValidateJwtToken(string token)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret!);

      try
      {
        tokenHandler.ValidateToken(token, new TokenValidationParameters
        {
          ValidateIssuerSigningKey = true,
          IssuerSigningKey = new SymmetricSecurityKey(key),
          ValidateIssuer = false,
          ValidateAudience = false,
          ClockSkew = TimeSpan.Zero
        }, out SecurityToken validatedToken);

        return true;
      }
      catch
      {
        return false;
      }
    }

    private string GenerateJwtToken(UserModel user)
    {
      var tokenHandler = new JwtSecurityTokenHandler();
      var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret!);
      var tokenDescriptor = new SecurityTokenDescriptor
      {
        Subject = new ClaimsIdentity(new[]
          {
                new Claim(ClaimTypes.NameIdentifier, user.Id!),
                new Claim(ClaimTypes.Email, user.Email!)
            }),
        Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes),
        SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
      };

      var token = tokenHandler.CreateToken(tokenDescriptor);
      return tokenHandler.WriteToken(token);
    }

  }
}
