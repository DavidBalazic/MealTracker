using Microsoft.AspNetCore.Mvc;
using RecipeService.Models;
using RecipeService.Services;

namespace RecipeService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly RecipesService _recipeService;

        public RecipesController(RecipesService recipeService)
        {
            _recipeService = recipeService;
        }

        [HttpGet]
        public async Task<ActionResult<List<Recipe>>> Get() => await _recipeService.GetAsync();

        [HttpGet("{id:length(24)}")]
        public async Task<ActionResult<Recipe>> Get(string id)
        {
            var recipe = await _recipeService.GetAsync(id);
            if (recipe == null) return NotFound();
            return recipe;
        }

        [HttpPost]
        public async Task<ActionResult> Post([FromBody] Recipe recipe)
        {
            await _recipeService.CreateAsync(recipe);
            return CreatedAtAction(nameof(Get), new { id = recipe.Id.ToString() }, recipe);
        }

        [HttpPut("{id:length(24)}")]
        public async Task<IActionResult> Update(string id, [FromBody] Recipe recipe)
        {
            var existingRecipe = await _recipeService.GetAsync(id);
            if (existingRecipe == null) return NotFound();
            recipe.Id = existingRecipe.Id;
            await _recipeService.UpdateAsync(id, recipe);
            return NoContent();
        }

        [HttpDelete("{id:length(24)}")]
        public async Task<IActionResult> Delete(string id)
        {
            var recipe = await _recipeService.GetAsync(id);
            if (recipe == null) return NotFound();
            await _recipeService.DeleteAsync(id);
            return NoContent();
        }
    }
}
