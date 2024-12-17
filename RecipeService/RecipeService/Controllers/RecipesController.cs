using Microsoft.AspNetCore.Mvc;
using RecipeService.Dtos;
using RecipeService.Integration;
using RecipeService.Models;
using RecipeService.Services;
using System.Runtime.InteropServices;

namespace RecipeService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RecipesController : ControllerBase
    {
        private readonly RecipesService _recipeService;
        private readonly FoodService _foodService;

        public RecipesController(RecipesService recipeService, FoodService foodService)
        {
            _recipeService = recipeService;
            _foodService = foodService;
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
        public async Task<ActionResult> Post([FromBody] RecipeRequest recipeRequest)
        {
            var recipe = new Recipe
            {
                Name = recipeRequest.Name,
                Ingredients = recipeRequest.Ingredients,
                TotalNutrition = new Nutrition(),
                Servings = recipeRequest.Servings,
                Instructions = recipeRequest.Instructions,
                Tags = recipeRequest.Tags
            };

            foreach (var ingredientRequest in recipeRequest.Ingredients)
            {
                var food = await _foodService.GetFoodAsync(ingredientRequest.FoodId);
                if (food == null) return BadRequest($"Food with ID {ingredientRequest.FoodId} not found.");

                recipe.TotalNutrition.Calories += food.Calories * ingredientRequest.Quantity / food.ServingSize;
                recipe.TotalNutrition.Protein += food.Protein * ingredientRequest.Quantity / food.ServingSize;
                recipe.TotalNutrition.Carbohydrates += food.Carbohydrates * ingredientRequest.Quantity / food.ServingSize;
                recipe.TotalNutrition.Fat += food.Fat * ingredientRequest.Quantity / food.ServingSize;
            }

            await _recipeService.CreateAsync(recipe);

            return CreatedAtAction(nameof(Get), new { id = recipe.Id }, recipe);
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
