using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MealTrackerService.Data; // Ensure the Data folder exists with DbContext defined
using MealTrackerService.Models; // Ensure MealPlan, Meal, etc., are defined in Models
using MealTrackerService.Services; // Ensure FoodServiceClient and UserServiceClient are implemented


namespace MealTrackerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MealTrackerController : ControllerBase
    {
        private readonly MealTrackerContext _context;
        private readonly FoodServiceClient _foodServiceClient;
        private readonly UserServiceClient _userServiceClient;

        public MealTrackerController(MealTrackerContext context, FoodServiceClient foodServiceClient, UserServiceClient userServiceClient)
        {
            _context = context;
            _foodServiceClient = foodServiceClient;
            _userServiceClient = userServiceClient;
        }

        // GET: api/mealtracker/mealplans
        [HttpGet("mealplans")]
        public async Task<ActionResult<List<MealPlan>>> GetMealPlans()
        {
            return await _context.MealPlans
                                 .Include(mp => mp.Meals)
                                 .ThenInclude(m => m.FoodItems)
                                 .ToListAsync();
        }

        // POST: api/mealtracker/mealplan
        [HttpPost("mealplan")]
        public async Task<ActionResult> CreateMealPlan([FromBody] MealPlan mealPlan)
        {
            if (mealPlan == null) return BadRequest("Invalid meal plan.");

            _context.MealPlans.Add(mealPlan);
            await _context.SaveChangesAsync();
            return Ok(mealPlan);
        }

        // DELETE: api/mealtracker/mealplan/{id}
        [HttpDelete("mealplan/{id}")]
        public async Task<ActionResult> DeleteMealPlan(int id)
        {
            var mealPlan = await _context.MealPlans.FindAsync(id);
            if (mealPlan == null) return NotFound("Meal plan not found.");

            _context.MealPlans.Remove(mealPlan);
            await _context.SaveChangesAsync();
            return Ok();
        }

        // PUT: api/mealtracker/mealplan/{id}
        [HttpPut("mealplan/{id}")]
        public async Task<ActionResult> UpdateMealPlan(int id, [FromBody] MealPlan updatedMealPlan)
        {
            var mealPlan = await _context.MealPlans.FindAsync(id);
            if (mealPlan == null) return NotFound("Meal plan not found.");

            mealPlan.Date = updatedMealPlan.Date;
            mealPlan.Meals = updatedMealPlan.Meals;

            await _context.SaveChangesAsync();
            return Ok(mealPlan);
        }

        // GET: api/mealtracker/meals/{id}
        [HttpGet("meals/{id}")]
        public async Task<ActionResult<Meal>> GetMeal(int id)
        {
            var meal = await _context.Meals
                                     .Include(m => m.FoodItems)
                                     .FirstOrDefaultAsync(m => m.Id == id);
            if (meal == null) return NotFound("Meal not found.");
            return Ok(meal);
        }
        
        // Example: Get food item details from FoodService
        [HttpGet("food/{id}")]
        public async Task<ActionResult<FoodItem>> GetFoodItem(int id)
        {
            var foodItem = await _foodServiceClient.GetFoodItemAsync(id);
            if (foodItem == null) return NotFound("Food item not found.");
            return Ok(foodItem);
        }

        // Example: Get user health details from UserService
        [HttpGet("userhealth/{userId}")]
        public async Task<ActionResult<UserHealth>> GetUserHealth(int userId)
        {
            var userHealth = await _userServiceClient.GetUserHealthAsync(userId);
            if (userHealth == null) return NotFound("User health data not found.");
            return Ok(userHealth);
        }

    }
}
