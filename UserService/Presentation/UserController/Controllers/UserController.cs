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

        /// <summary>
        /// Registers a new user.
        /// </summary>
        /// <param name="request">The registration details, including email and password.</param>
        /// <returns>A response containing the new user's unique ID.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/Users/register
        ///     {
        ///         "email": "user@example.com",
        ///         "password": "StrongPassword123"
        ///     }
        /// 
        /// </remarks>
        /// <response code="200">Successfully registered a new user, returning the UserId.</response>
        /// <response code="400">Invalid request, including missing or malformed data.</response>
        [HttpPost("register")]
        [AllowAnonymous]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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

        /// <summary>
        /// Authenticates a user and returns a JWT token.
        /// </summary>
        /// <param name="request">The login details, including email and password.</param>
        /// <returns>A response containing the JWT token if authentication is successful.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/Users/login
        ///     {
        ///         "email": "user@example.com",
        ///         "password": "StrongPassword123"
        ///     }
        /// 
        /// </remarks>
        /// <response code="200">Successfully authenticated the user and generated a token.</response>
        /// <response code="400">Invalid request, including missing email or password.</response>
        /// <response code="401">Authentication failed due to invalid credentials.</response>
        [HttpPost("login")]
        [AllowAnonymous] 
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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


        /// <summary>
        /// Updates the authenticated user's password or email.
        /// </summary>
        /// <param name="request">The user update details, including a new password or email.</param>
        /// <returns>A response indicating whether the update was successful.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /api/Users/update
        ///     {
        ///         "userId": "63f1e4d5e70b2f00123abcde",
        ///         "newEmail": "newemail@example.com",
        ///         "newPassword": "NewPassword123!"
        ///     }
        ///
        /// If no `newEmail` or `newPassword` is provided, the respective fields will remain unchanged.
        /// </remarks>
        /// <response code="200">Successfully updated the user's password or email.</response>
        /// <response code="400">Invalid input, such as missing required fields or invalid values.</response>
        /// <response code="401">Unauthorized access, such as when the user is not authenticated.</response>
        [HttpPut("update")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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

        /// <summary>
        /// Validates the provided JWT token.
        /// </summary>
        /// <param name="token">The JWT token to validate.</param>
        /// <returns>A response indicating whether the token is valid.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     POST /api/Users/validate-token
        ///     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        /// 
        /// </remarks>
        /// <response code="200">The token is successfully validated.</response>
        /// <response code="401">Unauthorized access when the request lacks valid credentials.</response>
        [HttpPost("validate-token")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        public IActionResult ValidateToken([FromBody] string token)
        {
            var isValid = _userService.ValidateJwtToken(token);
            return Ok(new { IsValid = isValid });
        }

        /// <summary>
        /// Retrieves the authenticated user's information.
        /// </summary>
        /// <returns>A response containing the user's ID, email, and role.</returns>
        /// <remarks>
        /// This endpoint fetches information about the currently authenticated user based on their JWT token.
        /// 
        /// Sample response:
        /// 
        ///     {
        ///         "Message": "User Info",
        ///         "UserId": "63f1e4d5e70b2f00123abcde",
        ///         "Email": "user@example.com",
        ///         "Role": "admin"
        ///     }
        /// 
        /// </remarks>
        /// <response code="200">Successfully retrieved the user's information.</response>
        /// <response code="401">Unauthorized access when the request lacks valid credentials.</response>
        [HttpGet("user-info")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
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

        /// <summary>
        /// Deletes the currently authenticated user's account.
        /// </summary>
        /// <returns>A confirmation message indicating the account was deleted successfully.</returns>
        /// <remarks>
        /// This endpoint allows the authenticated user to delete their account permanently.
        /// 
        /// Sample request:
        /// 
        ///     DELETE /api/Users/delete-account
        /// 
        /// </remarks>
        /// <response code="200">Account deleted successfully.</response>
        /// <response code="401">Unauthorized if the user is not authenticated or the token is invalid.</response>
        /// <response code="400">Bad request if an error occurs during the deletion process.</response>
        [HttpDelete("delete-account")]
        [Authorize]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
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

        /// <summary>
        /// Deletes a user by their ID. Accessible only by admins.
        /// </summary>
        /// <param name="id">The ID of the user to delete.</param>
        /// <returns>A confirmation message indicating the user was deleted successfully.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     DELETE /api/Users/admin/delete-user/{id}
        /// 
        /// </remarks>
        /// <response code="200">User deleted successfully.</response>
        /// <response code="400">Bad request if the user ID is invalid or an error occurs.</response>
        /// <response code="401">Unauthorized if the admin is not authenticated.</response>
        /// <response code="403">Forbidden if the user does not have admin privileges.</response>
        [HttpDelete("admin/delete-user/{id}")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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

        /// <summary>
        /// Updates the role of a user by their ID. Accessible only by admins.
        /// </summary>
        /// <param name="id">The ID of the user whose role is being updated.</param>
        /// <param name="newRole">The new role to assign to the user.</param>
        /// <returns>A confirmation message indicating the role was updated successfully.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     PUT /api/Users/admin/update-role/{id}
        /// 
        /// Request body:
        /// 
        ///     "admin"
        /// 
        /// </remarks>
        /// <response code="200">User role updated successfully.</response>
        /// <response code="400">Bad request if the user ID or role is invalid.</response>
        /// <response code="401">Unauthorized if the admin is not authenticated.</response>
        /// <response code="403">Forbidden if the user does not have admin privileges.</response>
        [HttpPut("admin/update-role/{id}")]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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

        /// <summary>
        /// Retrieves all users or filters users by role. Accessible only by admins.
        /// </summary>
        /// <param name="role">Optional role to filter users. If not provided, retrieves all users.</param>
        /// <returns>A list of users matching the specified role or all users if no role is provided.</returns>
        /// <remarks>
        /// Sample request:
        /// 
        ///     GET /api/Users?role=admin
        /// 
        /// </remarks>
        /// <response code="200">Successfully retrieved the list of users.</response>
        /// <response code="400">Bad request if an error occurs during data retrieval.</response>
        /// <response code="401">Unauthorized if the admin is not authenticated.</response>
        /// <response code="403">Forbidden if the user does not have admin privileges.</response>
        [HttpGet]
        [Authorize(Roles = "admin")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
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
