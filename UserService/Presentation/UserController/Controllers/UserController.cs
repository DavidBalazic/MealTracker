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

    [HttpPost("register")]
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

    [HttpPost("login")]
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

    [HttpPut("update")]
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

    [HttpPost("validate-token")]
    public IActionResult ValidateToken([FromBody] string token)
    {
      var isValid = _userService.ValidateJwtToken(token);
      return Ok(new { IsValid = isValid });
    }
  }

}
