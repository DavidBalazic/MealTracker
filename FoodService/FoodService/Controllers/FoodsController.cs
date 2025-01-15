using FoodService.Models;
using FoodService.Services;
using Microsoft.AspNetCore.Mvc;

namespace FoodService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FoodsController : ControllerBase
    {
        private readonly FoodsService _foodService;

        public FoodsController(FoodsService foodService)
        {
            _foodService = foodService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Food>>> GetAll() => await _foodService.GetAllAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Food>> Get(string id)
        {
            var food = await _foodService.GetAsync(id);
            if (food == null) return NotFound();
            return food;
        }

        [HttpGet("maxCalories")]
        public async Task<ActionResult<List<Food>>> GetByMaxCalories([FromQuery] double maxCalories)
        {
            var foods = await _foodService.GetByMaxCaloriesAsync(maxCalories);

            if (foods == null || foods.Count == 0)
            {
                return NotFound(new { Message = "No foods found with fewer calories than the specified value." });
            }

            return Ok(foods);
        }

        [HttpGet("excludedAllergens")]
        public async Task<ActionResult<List<Food>>> GetByExcludedAllergens([FromQuery] List<string> allergens)
        {
            var foods = await _foodService.GetByExcludedAllergensAsync(allergens);

            if (foods == null || foods.Count == 0)
            {
                return NotFound(new { Message = "No foods found that do not contain the specified allergens." });
            }

            return Ok(foods);
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Food food)
        {
            await _foodService.CreateAsync(food);
            return CreatedAtAction(nameof(Get), new { id = food.Id.ToString() }, food);
        }

        [HttpPost("createMany")]
        public async Task<IActionResult> AddManyFoods([FromBody] List<Food> foods)
        {
            if (foods == null || foods.Count == 0)
            {
                return BadRequest(new { Message = "The food list cannot be empty." });
            }

            await _foodService.CreateManyAsync(foods);
            return CreatedAtAction(nameof(GetAll), new { count = foods.Count }, foods);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, [FromBody] Food food)
        {
            var existingFood = await _foodService.GetAsync(id);
            if (existingFood == null) return NotFound();
            food.Id = existingFood.Id;
            await _foodService.UpdateAsync(id, food);
            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var food = await _foodService.GetAsync(id);
            if (food == null) return NotFound();
            await _foodService.DeleteAsync(id);
            return NoContent();
        }

        [HttpDelete("deleteByName")]
        public async Task<IActionResult> DeleteByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { Message = "The name parameter cannot be empty." });
            }

            var deleteResult = await _foodService.DeleteByNameAsync(name);

            if (deleteResult.DeletedCount == 0)
            {
                return NotFound(new { Message = $"No foods found with names containing '{name}'." });
            }

            return Ok(new { Message = $"{deleteResult.DeletedCount} food(s) deleted successfully." });
        }
    }
}
