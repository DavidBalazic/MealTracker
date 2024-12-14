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
            var result = await _context.MealPlans.DeleteOneAsync(mp => mp.Id == id);
            if (result.DeletedCount == 0) return NotFound("Meal plan not found.");
            return Ok();
        }

        // PUT: api/mealtracker/mealplan/{id}
        [HttpPut("mealplan/{id}")]
        public async Task<ActionResult> UpdateMealPlan(string id, [FromBody] MealPlan updatedMealPlan)
        {
            if (updatedMealPlan == null || id != updatedMealPlan.Id)
            {
                return BadRequest("Invalid meal plan data or mismatched ID.");
            }

            var existingMealPlan = await _context.MealPlans.Find(mp => mp.Id == id).FirstOrDefaultAsync();
            if (existingMealPlan == null)
            {
                return NotFound("Meal plan not found.");
            }

            var result = await _context.MealPlans.ReplaceOneAsync(mp => mp.Id == id, updatedMealPlan);
            if (result.MatchedCount == 0)
            {
                return NotFound("Meal plan not updated.");
            }

            return Ok(updatedMealPlan);
        }

        // GET: api/mealtracker/meals/{id}
        [HttpGet("meals/{id}")]
        public async Task<ActionResult<Meal>> GetMeal(string id)
        {
            var meal = await _context.Meals.Find(m => m.Id == id).FirstOrDefaultAsync();
            if (meal == null) return NotFound("Meal not found.");
            return Ok(meal);
        }

        // POST: api/mealtracker/meal
        [HttpPost("meal")]
        public async Task<ActionResult> CreateMeal([FromBody] Meal meal)
        {
            if (meal == null) return BadRequest("Invalid meal.");

            await _context.Meals.InsertOneAsync(meal);
            return Ok(meal);
        }

        // DELETE: api/mealtracker/meal/{id}
        [HttpDelete("meal/{id}")]
        public async Task<ActionResult> DeleteMeal(string id)
        {
            var result = await _context.Meals.DeleteOneAsync(m => m.Id == id);
            if (result.DeletedCount == 0) return NotFound("Meal not found.");
            return Ok();
        }

        // GET: api/mealtracker/food/{id}
        [HttpGet("food/{id}")]
        public async Task<ActionResult<FoodItem>> GetFoodItem(string id)
        {
            var foodItem = await _context.FoodItems.Find(f => f.Id == id).FirstOrDefaultAsync();
            if (foodItem == null) return NotFound("Food item not found.");
            return Ok(foodItem);
        }

        // GET: api/mealtracker/userhealth/{userId}
        [HttpGet("userhealth/{userId}")]
        public async Task<ActionResult<UserHealth>> GetUserHealth(string userId)
        {
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
