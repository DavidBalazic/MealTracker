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
    /// <summary>
    /// Controller for managing meal plans, meals, and food items.
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    public class MealTrackerController : ControllerBase
    {
        private readonly IMealTrackerContext _context;
        private readonly FoodServiceClient.FoodServiceClient _foodServiceClient;

        /// <summary>
        /// Initializes a new instance of the <see cref="MealTrackerController"/> class.
        /// </summary>
        /// <param name="context">Database context for meal tracking.</param>
        /// <param name="foodServiceClient">Client for interacting with the Food Service.</param>
        public MealTrackerController(IMealTrackerContext context, FoodServiceClient.FoodServiceClient foodServiceClient)
        {
            _context = context;
            _foodServiceClient = foodServiceClient;
        }

        /// <summary>
        /// Retrieves all meal plans, including detailed food information for each meal.
        /// </summary>
        /// <returns>A list of all meal plans with detailed information.</returns>
        /// <response code="200">Returns the list of meal plans.</response>
        /// <response code="500">Internal server error.</response>
        [HttpGet("mealplans")]
        public async Task<IActionResult> GetMealPlans()
        {
            try
            {
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
                                var food = await _foodServiceClient.FoodsGETAsync(foodId);
                                if (food != null)
                                {
                                    foodDetails.Add(food);
                                }
                            }
                            catch (ApiException ex) when (ex.StatusCode == 404)
                            {
                                continue;
                            }
                            catch (Exception ex)
                            {
                                Console.WriteLine($"Error fetching food with ID {foodId}: {ex.Message}");
                            }
                        }

                        meal.Foods = foodDetails;
                    }
                }

                return Ok(mealPlans);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving meal plans: {ex.Message}");
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        /// <summary>
        /// Updates an existing meal plan.
        /// </summary>
        /// <param name="id">The ID of the meal plan to update.</param>
        /// <param name="updatedMealPlan">The updated meal plan object.</param>
        /// <returns>The updated meal plan.</returns>
        /// <response code="200">Returns the updated meal plan.</response>
        /// <response code="400">Bad request, e.g., invalid meal plan data.</response>
        /// <response code="404">Meal plan not found.</response>
        [HttpPut("mealplan/{id}")]
        public async Task<IActionResult> UpdateMealPlan(string id, [FromBody] MealPlan updatedMealPlan)
        {
            if (updatedMealPlan == null) return BadRequest("MealPlan cannot be null.");
            if (id != updatedMealPlan.Id) return BadRequest("ID mismatch.");

            try
            {
                var existingMealPlan = await _context.MealPlans.Find(m => m.Id == id).FirstOrDefaultAsync();
                if (existingMealPlan == null) return NotFound($"MealPlan with id {id} does not exist.");

                foreach (var meal in updatedMealPlan.Meals)
                {
                    var updatedFoodIds = new List<string>();
                    foreach (var food in meal.Foods)
                    {
                        if (string.IsNullOrEmpty(food.Id) || !ObjectId.TryParse(food.Id, out _))
                            return BadRequest($"Food '{food.Name}' must have a valid 24-digit hex string ID.");

                        await UpdateFoodIfExistsAsync(food);
                        updatedFoodIds.Add(food.Id);
                    }
                    meal.FoodIds = updatedFoodIds;
                    meal.Foods.Clear();
                }

                var filter = Builders<MealPlan>.Filter.Eq(m => m.Id, id);
                await _context.MealPlans.ReplaceOneAsync(filter, updatedMealPlan);
                return Ok(updatedMealPlan);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating meal plan: {ex.Message}");
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
        private async Task<bool> UpdateFoodIfExistsAsync(Food food)
        {
            try
            {
                var existingFood = await _foodServiceClient.FoodsGETAsync(food.Id);
                if (existingFood != null)
                {
                    await HandleFoodPUTAsync(food);
                    return true;
                }
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                await HandleFoodPOSTAsync(food);
                return true;
            }
            catch (ApiException ex) when (ex.StatusCode == 201)
            {
                Console.WriteLine($"Food successfully created: {ex.Response}");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error while updating food: {ex.Message}");
                throw;
            }
            return false;
        }

        /// <summary>
        /// Creates a new meal plan.
        /// </summary>
        /// <param name="mealPlan">The meal plan to create.</param>
        /// <returns>The created meal plan.</returns>
        /// <response code="201">Meal plan successfully created.</response>
        /// <response code="400">Bad request, e.g., invalid meal plan data.</response>
        [HttpPost("mealplan")]
        public async Task<IActionResult> CreateMealPlan([FromBody] MealPlan mealPlan)
        {
            if (mealPlan == null) return BadRequest("MealPlan cannot be null.");

            try
            {
                foreach (var meal in mealPlan.Meals)
                {
                    var newFoodIds = new List<string>();
                    foreach (var food in meal.Foods)
                    {
                        if (string.IsNullOrEmpty(food.Id) || !ObjectId.TryParse(food.Id, out _))
                            return BadRequest($"Food '{food.Name}' must have a valid 24-digit hex string ID.");

                        await EnsureFoodInDatabaseAsync(food);
                        newFoodIds.Add(food.Id);
                    }
                    meal.FoodIds = newFoodIds;
                    meal.Foods.Clear();
                }
                await _context.MealPlans.InsertOneAsync(mealPlan);
                return CreatedAtAction(nameof(GetMealPlans), new { id = mealPlan.Id }, mealPlan);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating meal plan: {ex.Message}");
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }
        
        private async Task EnsureFoodInDatabaseAsync(Food food)
        {
            try
            {
                var existingFood = await _foodServiceClient.FoodsGETAsync(food.Id);
                if (existingFood != null)
                {
                    await HandleFoodPUTAsync(food);
                }
                else
                {
                    await HandleFoodPOSTAsync(food);
                }
            }
            catch (ApiException ex) when (ex.StatusCode == 404)
            {
                await HandleFoodPOSTAsync(food);
            }
            catch (ApiException ex) when (ex.StatusCode == 201)
            {
                Console.WriteLine($"Food successfully created: {ex.Response}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error ensuring food: {ex.Message}");
                throw;
            }
        }


        /// <summary>
        /// Handles creating a new food item via the Food Service.
        /// </summary>
        /// <param name="food">The food item to create.</param>
        private async Task HandleFoodPOSTAsync(Food food)
        {
            try
            {
                await _foodServiceClient.FoodsPOSTAsync(food);
            }
            catch (ApiException ex) when (ex.StatusCode == 201)
            {
                // Handle 201 Created as a successful creation
                Console.WriteLine($"Food successfully created: {ex.Response}");
            }
            catch (ApiException ex)
            {
                Console.WriteLine($"Unexpected error during food creation: {ex.Message}");
                throw;
            }
        }
        
        /// <summary>
        /// Handles updating an existing food item via the Food Service.
        /// </summary>
        /// <param name="food">The food item to update.</param>
        private async Task HandleFoodPUTAsync(Food food)
        {
            try
            {
                await _foodServiceClient.FoodsPUTAsync(food.Id, food);
            }
            catch (ApiException ex) when (ex.StatusCode == 204)
            {
                return;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Unexpected error during food update: {ex.Message}");
                throw;
            }
        }


        /// <summary>
        /// Deletes a meal plan by ID.
        /// </summary>
        /// <param name="id">The ID of the meal plan to delete.</param>
        /// <returns>No content if successful.</returns>
        /// <response code="204">Meal plan successfully deleted.</response>
        /// <response code="404">Meal plan not found.</response>
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

        /// <summary>
        /// Retrieves all foods from the Food Service.
        /// </summary>
        /// <returns>A list of all foods.</returns>
        /// <response code="200">Returns a list of all foods.</response>
        [HttpGet("foods")]
        public async Task<IActionResult> GetAllFoods()
        {
            var foods = await _foodServiceClient.FoodsAllAsync();
            return Ok(foods);
        }

        /// <summary>
        /// Retrieves a food by its ID.
        /// </summary>
        /// <param name="id">The ID of the food to retrieve.</param>
        /// <returns>The food with the specified ID.</returns>
        /// <response code="200">Returns the food details.</response>
        /// <response code="404">Food not found.</response>
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

        /// <summary>
        /// Retrieves a meal by its ID.
        /// </summary>
        /// <param name="id">The ID of the meal to retrieve.</param>
        /// <returns>The meal with the specified ID, including food details.</returns>
        /// <response code="200">Returns the meal details.</response>
        /// <response code="404">Meal not found.</response>
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
