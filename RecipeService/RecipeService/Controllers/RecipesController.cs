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
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Recipe>>> GetAll() => await _recipeService.GetAsync();

        [HttpGet("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Recipe>> Get(string id)
        {
            var recipe = await _recipeService.GetAsync(id);
            if (recipe == null) return NotFound();
            return recipe;
        }

        [HttpGet("byTag")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<Recipe>>> GetRecipesByTag([FromQuery] string tag)
        {
            var recipes = await _recipeService.GetByTagAsync(tag);

            if (recipes == null || recipes.Count == 0)
            {
                return NotFound(new { Message = $"No recipes found with the tag '{tag}'." });
            }

            return Ok(recipes);
        }

        [HttpGet("belowCalories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<Recipe>>> GetByMaxCalories([FromQuery] double maxCalories)
        {
            var foods = await _recipeService.GetByMaxCaloriesAsync(maxCalories);

            if (foods == null || foods.Count == 0)
            {
                return NotFound(new { Message = "No recipies found with fewer calories than the specified value." });
            }

            return Ok(foods);
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> Post([FromBody] RecipeRequestDto recipeRequest)
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

        [HttpPost("createMany")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult> PostMany([FromBody] List<RecipeRequestDto> recipeRequests)
        {
            if (recipeRequests == null || recipeRequests.Count == 0)
            {
                return BadRequest(new { Message = "The recipe list cannot be empty." });
            }

            var recipes = new List<Recipe>();

            foreach (var recipeRequest in recipeRequests)
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

                recipes.Add(recipe);
            }

            await _recipeService.CreateManyAsync(recipes);

            return CreatedAtAction(nameof(GetAll), new { count = recipes.Count }, recipes);
        }

        [HttpPut("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update(string id, [FromBody] RecipeRequestDto recipeRequest)
        {
            if (recipeRequest == null)
                return BadRequest(new { Message = "RecipeRequest cannot be null." });

            var existingRecipe = await _recipeService.GetAsync(id);
            if (existingRecipe == null)
                return NotFound(new { Message = $"Recipe with ID {id} not found." });

            existingRecipe.Name = recipeRequest.Name ?? existingRecipe.Name;
            existingRecipe.Ingredients = recipeRequest.Ingredients ?? existingRecipe.Ingredients;
            existingRecipe.Servings = recipeRequest.Servings != 0 ? recipeRequest.Servings : existingRecipe.Servings;
            existingRecipe.Instructions = recipeRequest.Instructions ?? existingRecipe.Instructions;
            existingRecipe.Tags = recipeRequest.Tags ?? existingRecipe.Tags;

            if (recipeRequest.Ingredients != null)
            {
                existingRecipe.TotalNutrition = new Nutrition();
                foreach (var ingredientRequest in recipeRequest.Ingredients)
                {
                    var food = await _foodService.GetFoodAsync(ingredientRequest.FoodId);
                    if (food == null) return BadRequest($"Food with ID {ingredientRequest.FoodId} not found.");

                    existingRecipe.TotalNutrition.Calories += food.Calories * ingredientRequest.Quantity / food.ServingSize;
                    existingRecipe.TotalNutrition.Protein += food.Protein * ingredientRequest.Quantity / food.ServingSize;
                    existingRecipe.TotalNutrition.Carbohydrates += food.Carbohydrates * ingredientRequest.Quantity / food.ServingSize;
                    existingRecipe.TotalNutrition.Fat += food.Fat * ingredientRequest.Quantity / food.ServingSize;
                }
            }

            await _recipeService.UpdateAsync(id, existingRecipe);
            return NoContent();
        }

        [HttpPut("{id:length(24)}/updateTags")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateRecipeTags(string id, [FromBody] List<string> tags)
        {
            var existingRecipe = await _recipeService.GetAsync(id);

            if (existingRecipe == null)
            {
                return NotFound(new { Message = $"No recipe found with ID '{id}'." });
            }

            existingRecipe.Tags = tags;
            await _recipeService.UpdateAsync(id, existingRecipe);
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

        [HttpDelete("deleteByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { Message = "The name parameter cannot be empty." });
            }

            var deleteResult = await _recipeService.DeleteByNameAsync(name);

            if (deleteResult.DeletedCount == 0)
            {
                return NotFound(new { Message = $"No recipes found with the exact name '{name}'." });
            }

            return Ok(new { Message = $"{deleteResult.DeletedCount} food(s) deleted successfully." });
        }
    }
}
