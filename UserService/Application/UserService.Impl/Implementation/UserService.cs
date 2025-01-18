using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using MongoDB.Driver;
using System.Collections.Immutable;
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
            // Validate input
            if (string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Password))
            {
                throw new ArgumentException("Email and password are required.");
            }

            // Check if the user already exists
            var existingUser = await _users.Find(u => u.Email == registerDto.Email).FirstOrDefaultAsync();
            if (existingUser != null)
            {
                throw new Exception("User already exists.");
            }

            // Hash the password and create a new user with a default role
            var passwordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password);
            var newUser = new UserModel
            {
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                Role = "user" // Assign default role
            };

            // Save user to database
            await _users.InsertOneAsync(newUser);

            Console.WriteLine($"User registered successfully: {newUser.Email}");

            // Generate and return a token
            return GenerateJwtToken(newUser);
        }

        public async Task<string> LoginUserAsync(LoginDTO loginDto)
        {
            // Validate input
            if (string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.Password))
            {
                throw new ArgumentException("Email and password are required.");
            }

            // Log login attempt
            Console.WriteLine($"Login attempt for email: {loginDto.Email}");

            // Fetch user from database
            var user = await _users.Find(u => u.Email == loginDto.Email).FirstOrDefaultAsync();
            if (user == null)
            {
                Console.WriteLine($"User not found for email: {loginDto.Email}");
                throw new Exception("Invalid credentials.");
            }

            // Validate password
            if (string.IsNullOrEmpty(user.PasswordHash) || !BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash))
            {
                Console.WriteLine($"Invalid password for email: {loginDto.Email}");
                throw new Exception("Invalid credentials.");
            }

            Console.WriteLine($"User authenticated successfully for email: {loginDto.Email}");

            // Generate and return a token
            return GenerateJwtToken(user);
        }

        public async Task UpdateUserAsync(UpdateDTO updateDto)
        {
            if (string.IsNullOrEmpty(updateDto.UserId))
            {
                throw new ArgumentException("User ID is required to update the user.");
            }

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

            if (updates.Count == 0)
            {
                throw new ArgumentException("No updates provided.");
            }

            var result = await _users.UpdateOneAsync(
                u => u.Id == updateDto.UserId,
                update.Combine(updates)
            );

            if (result.ModifiedCount == 0)
            {
                throw new Exception("Failed to update user. User not found or no changes made.");
            }

            Console.WriteLine($"User updated successfully: {updateDto.UserId}");
        }

        public bool ValidateJwtToken(string token)
        {
            if (string.IsNullOrEmpty(token))
            {
                Console.WriteLine("Token validation failed: Token is null or empty.");
                return false;
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret!);

            try
            {
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = true,
                    ValidIssuer = _jwtSettings.Issuer,
                    ValidateAudience = false,
                    ClockSkew = TimeSpan.Zero
                }, out SecurityToken validatedToken);

                Console.WriteLine("Token validated successfully.");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Token validation failed: {ex.Message}");
                return false;
            }
        }

        private string GenerateJwtToken(UserModel user)
        {
            // Validate user data
            if (string.IsNullOrEmpty(user.Id) || string.IsNullOrEmpty(user.Email) || string.IsNullOrEmpty(user.Role))
            {
                throw new ArgumentException("User ID, email, and role are required to generate a token.");
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSettings.Secret!);

            // Configure token descriptor with all required claims
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(JwtRegisteredClaimNames.Sub, user.Id),       // User identifier
                    new Claim(ClaimTypes.Email, user.Email),               // Store email under ClaimTypes.Email
                    new Claim(ClaimTypes.Role, user.Role),                 // User's role
                    new Claim(JwtRegisteredClaimNames.Iat, 
                        DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64) // Issued at
                }),
                Expires = DateTime.UtcNow.AddMinutes(_jwtSettings.ExpirationInMinutes), // Expiry time
                Issuer = _jwtSettings.Issuer,                                           // Issuer
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            // Create and return the token
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task DeleteUserAccountAsync(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var deleteResult = await _users.DeleteOneAsync(u => u.Id == userId);
            if (deleteResult.DeletedCount == 0)
            {
                throw new Exception("Failed to delete the user.");
            }
        }

        public async Task AdminDeleteUserAsync(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var deleteResult = await _users.DeleteOneAsync(u => u.Id == userId);
            if (deleteResult.DeletedCount == 0)
            {
                throw new Exception("Failed to delete the user.");
            }
        }

        public async Task UpdateUserRoleAsync(string userId, string newRole)
        {
            var validRoles = new List<string> { "user", "admin" };
            if (!validRoles.Contains(newRole.ToLower()))
            {
                throw new Exception("Invalid role specified.");
            }

            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            if (user == null)
            {
                throw new Exception("User not found.");
            }

            var updateDefinition = Builders<UserModel>.Update.Set(u => u.Role, newRole);
            var updateResult = await _users.UpdateOneAsync(
                u => u.Id == userId,
                updateDefinition
            );

            if (updateResult.ModifiedCount == 0)
            {
                throw new Exception("Failed to update the user's role.");
            }
        }

        public async Task<List<UserInfoDTO>> GetAllUsersAsync(string role = null)
        {
            if (!string.IsNullOrEmpty(role))
            {
                return await _users
                    .Find(u => u.Role.ToLower() == role.ToLower())
                    .Project(u => new UserInfoDTO
                    {
                        Id = u.Id,
                        Email = u.Email,
                        Role = u.Role
                    })
                    .ToListAsync();
            }

            return await _users
                .Find(_ => true)
                .Project(u => new UserInfoDTO
                {
                    Id = u.Id,
                    Email = u.Email,
                    Role = u.Role
                })
                .ToListAsync();
        }
    }
}
