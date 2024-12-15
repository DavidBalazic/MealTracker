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
        public async Task<ActionResult<List<Food>>> Get() => await _foodService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Food>> Get(string id)
        {
            var food = await _foodService.GetAsync(id);
            if (food == null) return NotFound();
            return food;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Food food)
        {
            await _foodService.CreateAsync(food);
            return CreatedAtAction(nameof(Get), new { id = food.Id.ToString() }, food);
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
    }
}
