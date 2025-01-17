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

        /// <summary>
        /// Pridobi seznam vseh receptov.
        /// </summary>
        /// <returns>Seznam Receptov.</returns>
        /// <response code="200">Seznam uspešno pridobljen.</response>
        /// <response code="500">Napaka na strežniku.</response>
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<List<Recipe>>> GetAll() => await _recipeService.GetAsync();

        /// <summary>
        /// Pridobi recept po ID-ju.
        /// </summary>
        /// <param name="id">ID recepta (dolžina 24 znakov).</param>
        /// <returns>Podatki o receptu.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Recipes/675ed9ecdd35e38cb0c61281
        ///
        /// </remarks>
        /// <response code="200">Podatki uspešno pridobljeni.</response>
        /// <response code="404">Recept ni bil najden.</response>
        [HttpGet("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Recipe>> Get(string id)
        {
            var recipe = await _recipeService.GetAsync(id);
            if (recipe == null) return NotFound();
            return recipe;
        }

        /// <summary>
        /// Pridobi seznam receptov glede na oznako.
        /// </summary>
        /// <param name="tag">Oznaka, po kateri se filtrirajo recepti.</param>
        /// <returns>Seznam receptov z ustrezno oznako.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Recipes/byTag?tag=vegan
        ///
        /// </remarks>
        /// <response code="200">Seznam receptov uspešno pridobljen.</response>
        /// <response code="404">Recepti z dano oznako niso bili najdeni.</response>
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

        /// <summary>
        /// Pridobi seznam receptov z manj kot določenim številom kalorij.
        /// </summary>
        /// <param name="maxCalories">Najvišje število kalorij, ki jih lahko imajo recepti.</param>
        /// <returns>Seznam receptov z manj kalorijami od določene vrednosti.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Recipes/belowCalories?maxCalories=500
        ///
        /// </remarks>
        /// <response code="200">Seznam receptov uspešno pridobljen.</response>
        /// <response code="404">Recepti z manj kalorijami od določene vrednosti niso bili najdeni.</response>
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

        /// <summary>
        /// Ustvari nov recept.
        /// </summary>
        /// <param name="recipeRequest">Podatki o receptu za ustvarjanje.</param>
        /// <returns>Podatki o ustvarjenem receptu.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Recipes
        ///     {
        ///         "name": "Smoothie",
        ///         "ingredients": [
        ///             {
        ///                 "foodId": "64b8f740d8234c12d481",
        ///                 "quantity": 200
        ///             },
        ///             {
        ///                 "foodId": "64b8f740d8234c12d481",
        ///                 "quantity": 100
        ///             },
        ///             {
        ///                 "foodId": "64b8f740d8234c12d481",
        ///                 "quantity": 200
        ///             }
        ///         ],
        ///         "servings": 2,
        ///         "instructions": "Mix apple, strawberry and milk",
        ///         "tags": [ "Smotohie" ]
        ///     }
        ///
        /// </remarks>
        /// <response code="201">Recept uspešno ustvarjen.</response>
        /// <response code="400">Sestavina ne obstaja.</response>
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

        /// <summary>
        /// Ustvari več receptov hkrati.
        /// </summary>
        /// <param name="recipeRequests">Seznam podatkov o receptih za ustvarjanje.</param>
        /// <returns>Podatki o uspešno ustvarjenih receptih.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Recipes/createMany
        ///     [
        ///         {
        ///             "name": "Smoothie",
        ///             "ingredients": [
        ///                 {
        ///                     "foodId": "64b8f740d8234c12d481",
        ///                     "quantity": 200
        ///                 },
        ///                 {
        ///                     "foodId": "64b8f740d8234c12d481",
        ///                     "quantity": 100
        ///                 },
        ///                 {
        ///                     "foodId": "64b8f740d8234c12d481",
        ///                     "quantity": 200
        ///                 }
        ///             ],
        ///             "servings": 2,
        ///             "instructions": "Mix apple, strawberry and milk",
        ///             "tags": [ "Smotohie" ]
        ///         },
        ///         {
        ///             "name": "Chicken and Broccoli",
        ///             "ingredients": [
        ///                 {
        ///                     "foodId": "64b8f740d8234c12d482",
        ///                     "quantity": 150
        ///                 },
        ///                 {
        ///                     "foodId": "64b8f740d8234c12d482",
        ///                     "quantity": 200
        ///                 }
        ///             ],
        ///             "servings": 2,
        ///             "instructions": "Steam broccoli and fry chickhen",
        ///             "tags": [ "Healthy" ]
        ///         }
        ///     ]
        ///
        /// </remarks>
        /// <response code="201">Recepti so bili uspešno ustvarjeni.</response>
        /// <response code="400">Seznam receptov je prazen ali sestavina ne obstaja.</response>
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

        /// <summary>
        /// Posodobi obstoječi recept po ID-ju.
        /// </summary>
        /// <param name="id">ID recepta (dolžina 24 znakov).</param>
        /// <param name="recipeRequest">Posodobljeni podatki o receptu.</param>
        /// <returns>Potrditev o uspešni posodobitvi.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /Recipes/675ed9ecdd35e38cb0c61281
        ///     {
        ///         "name": "Smoothie",
        ///         "ingredients": [
        ///             {
        ///                 "foodId": "64b8f740d8234c12d481",
        ///                 "quantity": 150
        ///             }
        ///         ],
        ///         "servings": 2,
        ///         "instructions": "Zmešajte vse sestavine v mešalniku.",
        ///         "tags": [ "pijača", "zajtrk" ]
        ///     }
        /// </remarks>
        /// <response code="204">Recept je bil uspešno posodobljen.</response>
        /// <response code="404">Recept z navedenim ID-jem ni bil najden.</response>
        /// <response code="400">Podatki o receptu so napačni ali sestavina ne obstaja.</response>
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

        /// <summary>
        /// Posodobi oznake obstoječega recepta po ID-ju.
        /// </summary>
        /// <param name="id">ID recepta (dolžina 24 znakov).</param>
        /// <param name="tags">Seznam novih oznak za recept.</param>
        /// <returns>Potrditev o uspešni posodobitvi.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /Recipes/675ed9ecdd35e38cb0c61281/updateTags
        ///     
        ///     [ "Vegan", "Healthy" ]
        ///     
        /// </remarks>
        /// <response code="204">Oznake so bile uspešno posodobljene.</response>
        /// <response code="404">Recept z navedenim ID-jem ni bil najden.</response>
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

        /// <summary>
        /// Izbriše recept po ID-ju.
        /// </summary>
        /// <param name="id">ID recepta (dolžina 24 znakov).</param>
        /// <returns>Status o uspešnem ali neuspešnem brisanju.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     DELETE /Recipes/675ed9ecdd35e38cb0c61281
        ///
        /// </remarks>
        /// <response code="204">Recept je bil uspešno izbrisan.</response>
        /// <response code="404">Recept z navedenim ID-jem ni bil najden.</response>
        [HttpDelete("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string id)
        {
            var recipe = await _recipeService.GetAsync(id);
            if (recipe == null) return NotFound();
            await _recipeService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Izbriše recepte z določenim imenom.
        /// </summary>
        /// <param name="name">Ime recepta, ki ga želite izbrisati.</param>
        /// <returns>Status o uspešnem ali neuspešnem brisanju.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     DELETE /Recipes/deleteByName?name=Chocolate%20Cake
        ///
        /// </remarks>
        /// <response code="200">Recepti so bili uspešno izbrisani.</response>
        /// <response code="400">Ime ni bilo podano ali je bilo prazno.</response>
        /// <response code="404">Recepti z določenim imenom niso bili najdeni.</response>
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
