using Microsoft.Extensions.Options;
using MongoDB.Driver;
using RecipeService.Models;

namespace RecipeService.Services
{
    public class RecipesService
    {
        private readonly IMongoCollection<Recipe> _recipesCollection;

        public RecipesService(
        IOptions<RecipeServiceDatabaseSettings> recipeServiceDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                recipeServiceDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                recipeServiceDatabaseSettings.Value.DatabaseName);

            _recipesCollection = mongoDatabase.GetCollection<Recipe>(
                recipeServiceDatabaseSettings.Value.RecipeCollectionName);
        }

        // GET
        public async Task<List<Recipe>> GetAsync() => await _recipesCollection.Find(_ => true).ToListAsync();
        public async Task<Recipe> GetAsync(string id) => await _recipesCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        public async Task<List<Recipe>> GetByTagAsync(string tag)
        {
            var filter = Builders<Recipe>.Filter.Where(r => r.Tags.Any(t => t.ToLower() == tag.ToLower()));

            var recipes = await _recipesCollection.Find(filter).ToListAsync();

            return recipes;
        }
        public async Task<List<Recipe>> GetByMaxCaloriesAsync(double maxCalories) => await _recipesCollection.Find(f => f.TotalNutrition.Calories < maxCalories).ToListAsync();
        // POST
        public async Task CreateAsync(Recipe recipe) => await _recipesCollection.InsertOneAsync(recipe);
        public async Task CreateManyAsync(List<Recipe> recipes) => await _recipesCollection.InsertManyAsync(recipes);
        // PUT
        public async Task UpdateAsync(string id, Recipe updateRecipe) => await _recipesCollection.ReplaceOneAsync(p => p.Id == id, updateRecipe);
        // DELETE
        public async Task DeleteAsync(string id) => await _recipesCollection.DeleteOneAsync(p => p.Id == id);
        public async Task<DeleteResult> DeleteByNameAsync(string name)
        {
            return await _recipesCollection.DeleteManyAsync(f => f.Name == name);
        }
    }
}