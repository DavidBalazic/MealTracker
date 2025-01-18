using FoodService.DTOs;
using FoodService.Models;
using FoodService.Services;
using Microsoft.AspNetCore.Authorization;
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

        /// <summary>
        /// Pridobi seznam vseh živil.
        /// </summary>
        /// <returns>Seznam živil.</returns>
        /// <response code="200">Seznam uspešno pridobljen.</response>
        /// <response code="500">Napaka na strežniku.</response>
        [AllowAnonymous]
        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<List<Food>>> GetAll() => await _foodService.GetAllAsync();

        /// <summary>
        /// Pridobi živilo po ID-ju.
        /// </summary>
        /// <param name="id">ID živila (dolžina 24 znakov).</param>
        /// <returns>Podatki o živilu.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Foods/675ed9ecdd35e38cb0c61281
        ///
        /// </remarks>
        /// <response code="200">Podatki uspešno pridobljeni.</response>
        /// <response code="404">Živilo ni bilo najdeno.</response>
        [AllowAnonymous]
        [HttpGet("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Food>> Get(string id)
        {
            var food = await _foodService.GetAsync(id);
            if (food == null) return NotFound();
            return food;
        }

        /// <summary>
        /// Poišči živila, ki imajo manj kalorij, kot je določen maksimum.
        /// </summary>
        /// <param name="maxCalories">Maksimalno število kalorij za iskanje živil z manj kalorijami.</param>
        /// <returns>Seznam živil, ki ustrezajo pogoju za kalorije.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Foods/belowCalories?maxCalories=500
        ///
        /// </remarks>
        /// <response code="200">Uspešno vrnjen seznam živil.</response>
        /// <response code="404">Ni bilo najdenih živil, ki bi imela manj kalorij, kot je določeno.</response>
        [AllowAnonymous]
        [HttpGet("belowCalories")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<Food>>> GetByMaxCalories([FromQuery] double maxCalories)
        {
            var foods = await _foodService.GetByMaxCaloriesAsync(maxCalories);

            if (foods == null || foods.Count == 0)
            {
                return NotFound(new { Message = "No foods found with fewer calories than the specified value." });
            }

            return Ok(foods);
        }

        /// <summary>
        /// Poišči živila, ki ne vsebujejo določenih alergenov.
        /// </summary>
        /// <param name="allergens">Seznam alergenov, ki jih živila ne smejo vsebovati.</param>
        /// <returns>Seznam živil, ki ne vsebujejo katerega koli od navedenih alergenov.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     GET /Foods/excludedAllergens?allergens=Soy
        ///
        /// </remarks>
        /// <response code="200">Uspešno vrnjen seznam živil, ki ne vsebujejo alergenov.</response>
        /// <response code="404">Ni bilo najdenih živil brez navedenih alergenov.</response>
        [AllowAnonymous]
        [HttpGet("excludedAllergens")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<List<Food>>> GetByExcludedAllergens([FromQuery] List<string> allergens)
        {
            var foods = await _foodService.GetByExcludedAllergensAsync(allergens);

            if (foods == null || foods.Count == 0)
            {
                return NotFound(new { Message = "No foods found that do not contain the specified allergens." });
            }

            return Ok(foods);
        }

        /// <summary>
        /// Dodaj novo živilo.
        /// </summary>
        /// <param name="food">Podatki o živilu.</param>
        /// <returns>ID ustvarjenega živila.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Foods
        ///     {
        ///        "Name": "Peanut Butter",
        ///        "Calories": 588,
        ///        "Protein": 25,
        ///        "Carbohydrates": 20,
        ///        "Fat": 50,
        ///        "ServingSize": 100,
        ///        "Unit": "g",
        ///        "Allergens": [ "Peanuts", "Soy" ]
        ///     }
        ///
        /// </remarks>
        /// <response code="201">Živilo uspešno ustvarjeno.</response>
        /// <response code="401">Uporabnik ni pooblaščen za dostop.</response>
        /// <response code="403">Uporabnik nima zadostnih dovoljenj za dostop do tega vira.</response>
        /// <response code="400">Neveljavni podatki.</response>
        [Authorize(Roles = "admin")]
        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<ActionResult> Post([FromBody] FoodDto foodDto)
        {
            if (foodDto == null)
            {
                return BadRequest(new { Message = "Invalid food data provided." });
            }

            var food = new Food
            {
                Name = foodDto.Name,
                Calories = foodDto.Calories,
                Protein = foodDto.Protein,
                Carbohydrates = foodDto.Carbohydrates,
                Fat = foodDto.Fat,
                ServingSize = foodDto.ServingSize,
                Unit = foodDto.Unit,
                Allergens = foodDto.Allergens
            };

            await _foodService.CreateAsync(food);

            return CreatedAtAction(nameof(Get), new { id = food.Id.ToString() }, food);
        }

        /// <summary>
        /// Ustvari več živil naenkrat.
        /// </summary>
        /// <param name="foods">Seznam živil, ki jih želimo ustvariti.</param>
        /// <returns>Seznam ustvarjenih živil z uspešnim statusom.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     POST /Foods/createMany
        ///     [
        ///         {
        ///            "Name": "Peanut Butter",
        ///            "Calories": 588,
        ///            "Protein": 25,
        ///            "Carbohydrates": 20,
        ///            "Fat": 50,
        ///            "ServingSize": 100,
        ///            "Unit": "g",
        ///            "Allergens": [ "Peanuts", "Soy" ]
        ///         },
        ///         {
        ///            "Name": "Apple",
        ///            "Calories": 95,
        ///            "Protein": 0.5,
        ///            "Carbohydrates": 25,
        ///            "Fat": 0.3,
        ///            "ServingSize": 100,
        ///            "Unit": "g",
        ///            "Allergens": [ ]
        ///         },
        ///     ]
        ///     
        /// </remarks>
        /// <response code="201">Uspešno ustvarjen seznam živil.</response>
        /// <response code="400">Seznam živil je prazen ali ni veljaven.</response>
        /// <response code="401">Uporabnik ni pooblaščen za dostop.</response>
        /// <response code="403">Uporabnik nima zadostnih dovoljenj za dostop do tega vira.</response>
        [Authorize(Roles = "admin")]
        [HttpPost("createMany")]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddManyFoods([FromBody] List<FoodDto> foodDtos)
        {
            if (foodDtos == null || foodDtos.Count == 0)
            {
                return BadRequest(new { Message = "The food list cannot be empty." });
            }

            var foods = foodDtos.Select(dto => new Food
            {
                Name = dto.Name,
                Calories = dto.Calories,
                Protein = dto.Protein,
                Carbohydrates = dto.Carbohydrates,
                Fat = dto.Fat,
                ServingSize = dto.ServingSize,
                Unit = dto.Unit,
                Allergens = dto.Allergens
            }).ToList();

            await _foodService.CreateManyAsync(foods);

            return CreatedAtAction(nameof(GetAll), new { count = foods.Count }, foods);
        }

        /// <summary>
        /// Posodobi obstoječe živilo.
        /// </summary>
        /// <param name="id">ID živila (dolžina 24 znakov).</param>
        /// <param name="food">Posodobljeni podatki o živilu.</param>
        /// <returns>Status posodobitve.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     PUT /Foods/675ed9ecdd35e38cb0c61281
        ///     {
        ///        "Name": "Peanut Butter",
        ///        "Calories": 588,
        ///        "Protein": 25,
        ///        "Carbohydrates": 20,
        ///        "Fat": 50,
        ///        "ServingSize": 100,
        ///        "Unit": "g",
        ///        "Allergens": [ "Peanuts", "Soy" ]
        ///     }
        ///
        /// </remarks>
        /// <response code="204">Živilo uspešno posodobljeno.</response>
        /// <response code="404">Živilo ni bilo najdeno.</response>
        /// <response code="400">Seznam živil je prazen ali ni veljaven.</response>
        /// <response code="401">Uporabnik ni pooblaščen za dostop.</response>
        /// <response code="403">Uporabnik nima zadostnih dovoljenj za dostop do tega vira.</response>
        [Authorize(Roles = "admin")]
        [HttpPut("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update(string id, [FromBody] FoodDto foodDto)
        {
            if (string.IsNullOrWhiteSpace(id) || foodDto == null)
            {
                return BadRequest(new { Message = "Invalid ID or food data provided." });
            }

            var existingFood = await _foodService.GetAsync(id);
            if (existingFood == null) return NotFound(new { Message = "Food item not found." });

            existingFood.Name = foodDto.Name;
            existingFood.Calories = foodDto.Calories;
            existingFood.Protein = foodDto.Protein;
            existingFood.Carbohydrates = foodDto.Carbohydrates;
            existingFood.Fat = foodDto.Fat;
            existingFood.ServingSize = foodDto.ServingSize;
            existingFood.Unit = foodDto.Unit;
            existingFood.Allergens = foodDto.Allergens;
            await _foodService.UpdateAsync(id, existingFood);

            return NoContent();
        }

        /// <summary>
        /// Izbriši živilo po ID-ju.
        /// </summary>
        /// <param name="id">ID živila (dolžina 24 znakov).</param>
        /// <returns>Status izbrisa.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     DELETE /Foods/675ed9ecdd35e38cb0c61281
        ///
        /// </remarks>
        /// <response code="204">Živilo uspešno izbrisano.</response>
        /// <response code="401">Uporabnik ni pooblaščen za dostop.</response>
        /// <response code="403">Uporabnik nima zadostnih dovoljenj za dostop do tega vira.</response>
        /// <response code="404">Živilo ni bilo najdeno.</response>
        [Authorize(Roles = "admin")]
        [HttpDelete("{id:length(24)}")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete(string id)
        {
            var food = await _foodService.GetAsync(id);
            if (food == null) return NotFound();
            await _foodService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Izbriši živila glede na ime.
        /// </summary>
        /// <param name="name">Ime živila za brisanje.</param>
        /// <returns>Status brisanja.</returns>
        /// <remarks>
        /// Sample request:
        ///
        ///     DELETE /Foods/deleteByName?name=Peanut butter
        ///
        /// </remarks>
        /// <response code="200">Uspešno izbrisano določeno število živil.</response>
        /// <response code="400">Parameter ime ni določen ali je prazen.</response>
        /// <response code="401">Uporabnik ni pooblaščen za dostop.</response>
        /// <response code="403">Uporabnik nima zadostnih dovoljenj za dostop do tega vira.</response>
        /// <response code="404">Ni bilo najdenih živil za brisanje.</response>
        [Authorize(Roles = "admin")]
        [HttpDelete("deleteByName")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status403Forbidden)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteByName([FromQuery] string name)
        {
            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest(new { Message = "The name parameter cannot be empty." });
            }

            var deleteResult = await _foodService.DeleteByNameAsync(name);

            if (deleteResult.DeletedCount == 0)
            {
                return NotFound(new { Message = $"No foods found with the exact name '{name}'." });
            }

            return Ok(new { Message = $"{deleteResult.DeletedCount} food(s) deleted successfully." });
        }
    }
}
