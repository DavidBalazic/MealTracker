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

        [HttpGet("mealplans")]
        public async Task<IActionResult> GetMealPlans()
        {
            // Fetch all meal plans from the database
            var mealPlans = await _context.MealPlans.Find(_ => true).ToListAsync();

            foreach (var mealPlan in mealPlans)
            {
                foreach (var meal in mealPlan.Meals)
                {
                    var foodDetails = new List<Food>();

                    foreach (var foodId in meal.FoodIds)
                    {
                        try
                        {
                            // Attempt to fetch food details for each FoodId
                            var food = await _foodServiceClient.FoodsGETAsync(foodId);
                            if (food != null)
                            {
                                foodDetails.Add(food);
                            }
                        }
                        catch (ApiException ex) when (ex.StatusCode == 404)
                        {
                            // Gracefully handle the case where a food is not found
                            continue;
                        }
                        catch (Exception ex)
                        {
                            // Log other unexpected exceptions for debugging
                            Console.WriteLine($"Error fetching food with ID {foodId}: {ex.Message}");
                        }
                    }

                    // Update the Foods property with the retrieved details
                    meal.Foods = foodDetails;
                }
            }

            return Ok(mealPlans);
        }
        
        // PUT: api/mealtracker/mealplan/{id}
        [HttpPut("mealplan/{id}")]
        public async Task<IActionResult> UpdateMealPlan(string id, [FromBody] MealPlan updatedMealPlan)
        {
            if (updatedMealPlan == null)
            {
                return BadRequest("MealPlan cannot be null.");
            }

            if (id != updatedMealPlan.Id)
            {
                return BadRequest("ID in the URL does not match ID in the body.");
            }

            // Check if the MealPlan with the given ID exists
            var existingMealPlan = await _context.MealPlans.Find(m => m.Id == id).FirstOrDefaultAsync();
            if (existingMealPlan == null)
            {
                return NotFound($"MealPlan with id {id} does not exist.");
            }

            // Validate and update each meal and its foods
            foreach (var meal in updatedMealPlan.Meals)
            {
                var updatedFoodIds = new List<string>();

                foreach (var food in meal.Foods)
                {
                    if (string.IsNullOrEmpty(food.Id) || !ObjectId.TryParse(food.Id, out _))
                    {
                        return BadRequest($"Food '{food.Name}' must have a valid 24-digit hex string ID.");
                    }

                    // Ensure food exists and update it in the FoodService
                    var foodUpdated = await UpdateFoodIfExistsAsync(food);
                    if (!foodUpdated)
                    {
                        return NotFound($"Food with id {food.Id} does not exist in the FoodService.");
                    }

                    updatedFoodIds.Add(food.Id);
                }

                // Replace FoodIds and clear Foods to avoid duplication
                meal.FoodIds = updatedFoodIds;
                meal.Foods.Clear();
            }

            // Update the MealPlan in the database
            var filter = Builders<MealPlan>.Filter.Eq(m => m.Id, id);
            var updateResult = await _context.MealPlans.ReplaceOneAsync(filter, updatedMealPlan);

            if (updateResult.MatchedCount == 0)
            {
                return NotFound($"MealPlan with id {id} was not found.");
            }

            return Ok(updatedMealPlan);
        }

        private async Task<bool> UpdateFoodIfExistsAsync(Food food)
        {
            try
            {
                // Check if the food exists in the FoodService
                var existingFood = await _foodServiceClient.FoodsGETAsync(food.Id);

                if (existingFood != null)
                {
                    // If food exists, update it
                    try
                    {
                        await _foodServiceClient.FoodsPUTAsync(food.Id, food);
                    }
                    catch (ApiException ex) when (ex.StatusCode == 204)
                    {
                        // Treat 204 No Content as a successful update
                        return true;
                    }
                    return true;
                }
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                // If food is not found, insert it
                await _foodServiceClient.FoodsPOSTAsync(food);
                return true;
            }
            catch (ApiException ex)
            {
                // Re-throw other unexpected errors
                throw;
            }

            return false;
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
                // Check if the food exists in the FoodService
                var existingFood = await _foodServiceClient.FoodsGETAsync(food.Id);

                if (existingFood != null)
                {
                    // If the food exists, try updating it
                    await HandleFoodPUTAsync(food);
                }
                else
                {
                    // If the food does not exist, insert it
                    await _foodServiceClient.FoodsPOSTAsync(food);
                }
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                // If food is not found, insert it
                await _foodServiceClient.FoodsPOSTAsync(food);
            }
            catch (ApiException ex)
            {
                // Re-throw unexpected errors
                throw;
            }
        }

        private async Task HandleFoodPUTAsync(Food food)
        {
            try
            {
                // Attempt to update the food
                await _foodServiceClient.FoodsPUTAsync(food.Id, food);
            }
            catch (ApiException ex) when (ex.StatusCode == 204)
            {
                // Treat 204 No Content as a successful update
                return;
            }
            catch (ApiException ex)
            {
                // Re-throw unexpected errors
                throw;
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
