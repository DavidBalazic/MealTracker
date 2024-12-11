using Microsoft.AspNetCore.Mvc;
using MealTrackerService.Data;
using MealTrackerService.Models;
using MealTrackerService.Services;
using MongoDB.Driver;

namespace MealTrackerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MealTrackerController : ControllerBase
    {
        private readonly IMealTrackerContext _context;
        private readonly FoodServiceClient _foodServiceClient;
        private readonly UserServiceClient _userServiceClient;

        public MealTrackerController(IMealTrackerContext context, FoodServiceClient foodServiceClient, UserServiceClient userServiceClient)
        {
            _context = context;
            _foodServiceClient = foodServiceClient;
            _userServiceClient = userServiceClient;
        }

        // GET: api/mealtracker/mealplans
        [HttpGet("mealplans")]
        public async Task<ActionResult<List<MealPlan>>> GetMealPlans()
        {
            var mealPlans = await _context.MealPlans.Find(_ => true).ToListAsync();
            return Ok(mealPlans);
        }

        // POST: api/mealtracker/mealplan
        [HttpPost("mealplan")]
        public async Task<ActionResult> CreateMealPlan([FromBody] MealPlan mealPlan)
        {
            if (mealPlan == null) return BadRequest("Invalid meal plan.");

            await _context.MealPlans.InsertOneAsync(mealPlan);
            return Ok(mealPlan);
        }

        // DELETE: api/mealtracker/mealplan/{id}
        [HttpDelete("mealplan/{id}")]
        public async Task<ActionResult> DeleteMealPlan(string id)
        {
            // Assuming IDs are strings in the database
            var result = await _context.MealPlans.DeleteOneAsync(mp => mp.Id == id);
            if (result.DeletedCount == 0) return NotFound("Meal plan not found.");
            return Ok();
        }

        // GET: api/mealtracker/meals/{id}
        [HttpGet("meals/{id}")]
        public async Task<ActionResult<Meal>> GetMeal(string id)
        {
            // Assuming IDs are strings
            var meal = await _context.Meals.Find(m => m.Id == id).FirstOrDefaultAsync();
            if (meal == null) return NotFound("Meal not found.");
            return Ok(meal);
        }

		// GET: api/mealtracker/food/{id}
		[HttpGet("food/{id}")]
		public async Task<ActionResult<FoodItem>> GetFoodItem(string id)
		{
    		// Assuming IDs are strings in the database
    		var foodItem = await _context.FoodItems.Find(f => f.Id == id).FirstOrDefaultAsync();

    		// Handle the case where the food item is not found
    		if (foodItem == null)
    		{
        		return NotFound("Food item not found.");
    		}

    		return Ok(foodItem);
		}

        // GET: api/mealtracker/userhealth/{userId}
        [HttpGet("userhealth/{userId}")]
        public async Task<ActionResult<UserHealth>> GetUserHealth(string userId)
        {
            // Ensure userId is parsed as an integer before calling the service
            if (!int.TryParse(userId, out int userIdInt))
            {
                return BadRequest("Invalid user ID. Must be an integer.");
            }

            var userHealth = await _userServiceClient.GetUserHealthAsync(userIdInt);
            if (userHealth == null) return NotFound("User health data not found.");
            return Ok(userHealth);
        }
    }
}
