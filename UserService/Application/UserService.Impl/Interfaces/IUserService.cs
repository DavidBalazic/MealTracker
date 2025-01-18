using UserServices.Impl.DTOs;
using UserServices.Impl.Models;

namespace UserServices.Impl.Interfaces
{
  public interface IUserService
  {
    Task<string> RegisterUserAsync(RegisterDTO registerDto);
    Task<string> LoginUserAsync(LoginDTO loginDto);
    Task UpdateUserAsync(UpdateDTO updateDto);
    bool ValidateJwtToken(string token);
    Task DeleteUserAccountAsync(string userId);
    Task AdminDeleteUserAsync(string userId);
    Task UpdateUserRoleAsync(string userId, string newRole);
    Task<List<UserInfoDTO>> GetAllUsersAsync(string role = null);
    }
}
