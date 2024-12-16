using Microsoft.AspNetCore.Mvc;
using MealTrackerService.Data;
using MealTrackerService.Models;
using MongoDB.Driver;
using MongoDB.Bson; 
using System.Collections.Generic;
using System.Threading.Tasks;
using FoodServiceClient;

namespace MealTrackerService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MealTrackerController : ControllerBase
    {
        private readonly IMealTrackerContext _context;
        private readonly FoodServiceClient.FoodServiceClient _foodServiceClient;

        public MealTrackerController(IMealTrackerContext context, FoodServiceClient.FoodServiceClient foodServiceClient)
        {
            _context = context;
            _foodServiceClient = foodServiceClient;
        }

        // GET: api/mealtracker/mealplans
        [HttpGet("mealplans")]
        public async Task<IActionResult> GetMealPlans()
        {
            var mealPlans = await _context.MealPlans.Find(_ => true).ToListAsync();

            foreach (var mealPlan in mealPlans)
            {
                foreach (var meal in mealPlan.Meals)
                {
                    // Fetch food details for each FoodId in the meal
                    foreach (var foodId in meal.FoodIds)
                    {
                        var food = await _foodServiceClient.FoodsGETAsync(foodId);
                        if (food != null)
                        {
                            meal.Foods.Add(food);
                        }
                    }
                }
            }

            return Ok(mealPlans);
        }

        // POST: api/mealtracker/mealplan
        [HttpPost("mealplan")]
        public async Task<IActionResult> CreateMealPlan([FromBody] MealPlan mealPlan)
        {
            if (mealPlan == null)
            {
                return BadRequest("MealPlan cannot be null.");
            }

            // Process each meal and its foods
            foreach (var meal in mealPlan.Meals)
            {
                var newFoodIds = new List<string>();

                foreach (var food in meal.Foods)
                {
                    if (string.IsNullOrEmpty(food.Id) || !ObjectId.TryParse(food.Id, out _))
                    {
                        // If ID is not valid, return a bad request
                        return BadRequest($"Food '{food.Name}' must have a valid 24-digit hex string ID.");
                    }
                    else
                    {
                        // Add the food to the FoodService (ensure no duplicates)
                        await EnsureFoodInDatabaseAsync(food);

                        // Add the specified Food ID to the list
                        newFoodIds.Add(food.Id);
                    }
                }

                // Replace the FoodIds list with the updated list (new or existing)
                meal.FoodIds = newFoodIds;
                meal.Foods.Clear(); // Optionally clear Foods, as IDs suffice
            }

            // Insert the updated MealPlan into the MealPlan DB
            await _context.MealPlans.InsertOneAsync(mealPlan);

            return CreatedAtAction(nameof(GetMealPlans), new { id = mealPlan.Id }, mealPlan);
        }

        private async Task EnsureFoodInDatabaseAsync(Food food)
        {
            try
            {
                // Check if food already exists in the FoodService
                var existingFood = await _foodServiceClient.FoodsGETAsync(food.Id);
                if (existingFood == null)
                {
                    // If food doesn't exist, add it to the FoodService
                    await _foodServiceClient.FoodsPOSTAsync(food);
                }
            }
            catch (ApiException)
            {
                // If the food is not found or any error occurs, insert it
                await _foodServiceClient.FoodsPOSTAsync(food);
            }
        }
        
        // DELETE: api/mealtracker/mealplan/{id}
        [HttpDelete("mealplan/{id}")]
        public async Task<IActionResult> DeleteMealPlan(string id)
        {
            var result = await _context.MealPlans.DeleteOneAsync(m => m.Id == id);

            if (result.DeletedCount == 0)
            {
                return NotFound($"MealPlan with id {id} not found.");
            }

            return NoContent();
        }

        // GET: api/mealtracker/foods
        [HttpGet("foods")]
        public async Task<IActionResult> GetAllFoods()
        {
            var foods = await _foodServiceClient.FoodsAllAsync();
            return Ok(foods);
        }

        // GET: api/mealtracker/food/{id}
        [HttpGet("food/{id}")]
        public async Task<IActionResult> GetFoodById(string id)
        {
            var food = await _foodServiceClient.FoodsGETAsync(id);
            if (food == null)
            {
                return NotFound($"Food with id {id} not found.");
            }

            return Ok(food);
        }

        // GET: api/mealtracker/meal/{id}
        [HttpGet("meal/{id}")]
        public async Task<IActionResult> GetMealById(string id)
        {
            var mealPlan = await _context.MealPlans
                .Find(m => m.Meals.Any(meal => meal.Id == id))
                .FirstOrDefaultAsync();

            if (mealPlan == null)
            {
                return NotFound($"Meal with id {id} not found.");
            }

            var meal = mealPlan.Meals.Find(meal => meal.Id == id);

            foreach (var foodId in meal.FoodIds)
            {
                var food = await _foodServiceClient.FoodsGETAsync(foodId);
                if (food != null)
                {
                    meal.Foods.Add(food);
                }
            }

            return Ok(meal);
        }
    }
}
