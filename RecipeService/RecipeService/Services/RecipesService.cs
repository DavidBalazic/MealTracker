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

        public async Task<List<Recipe>> GetAsync() => await _recipesCollection.Find(_ => true).ToListAsync();
        public async Task<Recipe> GetAsync(string id) => await _recipesCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Recipe recipe) => await _recipesCollection.InsertOneAsync(recipe);
        public async Task UpdateAsync(string id, Recipe updateRecipe) => await _recipesCollection.ReplaceOneAsync(p => p.Id == id, updateRecipe);
        public async Task DeleteAsync(string id) => await _recipesCollection.DeleteOneAsync(p => p.Id == id);
    }
}