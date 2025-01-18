using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using UserServices.Impl.DTOs;
using UserServices.Impl.Interfaces;

namespace UserController.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;

        public UsersController(IUserService userService)
        {
            _userService = userService;
        }

        // Public endpoint: Register a new user
        [HttpPost("register")]
        [AllowAnonymous] // No authentication required
        public async Task<IActionResult> Register([FromBody] RegisterDTO request)
        {
            try
            {
                var userId = await _userService.RegisterUserAsync(request);
                return Ok(new { UserId = userId });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Public endpoint: Login
        [HttpPost("login")]
        [AllowAnonymous] // No authentication required
        public async Task<IActionResult> Login([FromBody] LoginDTO request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
                {
                    throw new ArgumentException("Email and password are required.");
                }

                Console.WriteLine($"Login attempt for email: {request.Email}");

                var token = await _userService.LoginUserAsync(request);

                if (string.IsNullOrEmpty(token))
                {
                    throw new Exception("Token generation failed.");
                }

                Console.WriteLine($"Login successful, token generated for email: {request.Email}");
                return Ok(new { Token = token });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                return Unauthorized(new { Error = ex.Message });
            }
        }

        // Protected endpoint: Update user details (requires authentication)
        [HttpPut("update")]
        [Authorize] // Authentication required
        public async Task<IActionResult> Update([FromBody] UpdateDTO request)
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Error = "User ID not found in token" });
                }

                await _userService.UpdateUserAsync(request);
                return Ok();
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        // Protected endpoint: Validate token (requires authentication)
        [HttpPost("validate-token")]
        [Authorize] // Authentication required
        public IActionResult ValidateToken([FromBody] string token)
        {
            var isValid = _userService.ValidateJwtToken(token);
            return Ok(new { IsValid = isValid });
        }

        [HttpGet("user-info")]
        [Authorize]
        public IActionResult UserInfo()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier); 
            var userEmail = User.FindFirstValue(ClaimTypes.Email);    
            var userRole = User.FindFirstValue(ClaimTypes.Role);       

            return Ok(new
            {
                Message = "User Info",
                UserId = userId,
                Email = userEmail, 
                Role = userRole
            });
        }

        [HttpDelete("delete-account")]
        [Authorize]
        public async Task<IActionResult> DeleteAccount()
        {
            try
            {
                var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
                if (string.IsNullOrEmpty(userId))
                {
                    return Unauthorized(new { Error = "User ID not found in token." });
                }

                await _userService.DeleteUserAccountAsync(userId);
                return Ok(new { Message = "Your account has been deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpDelete("admin/delete-user/{id}")]
        [Authorize(Roles = "admin")] 
        public async Task<IActionResult> DeleteUser(string id)
        {
            try
            {
                await _userService.AdminDeleteUserAsync(id);
                return Ok(new { Message = $"User with ID {id} has been deleted successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpPut("admin/update-role/{id}")]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> UpdateUserRole(string id, [FromBody] string newRole)
        {
            try
            {
                await _userService.UpdateUserRoleAsync(id, newRole);
                return Ok(new { Message = $"User with ID {id} has been updated to role '{newRole}' successfully." });
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }

        [HttpGet]
        [Authorize(Roles = "admin")]
        public async Task<IActionResult> GetAllUsers([FromQuery] string role)
        {
            try
            {
                var users = await _userService.GetAllUsersAsync(role);
                return Ok(users);
            }
            catch (Exception ex)
            {
                return BadRequest(new { Error = ex.Message });
            }
        }
    }
}
