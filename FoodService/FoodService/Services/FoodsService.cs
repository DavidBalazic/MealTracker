using FoodService.DTOs;
using FoodService.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace FoodService.Services
{
    public class FoodsService
    {
        private readonly IMongoCollection<Food> _foodsCollection;

        public FoodsService(
        IOptions<FoodServiceDatabaseSettings> foodServiceDatabaseSettings)
        {
            var mongoClient = new MongoClient(
                foodServiceDatabaseSettings.Value.ConnectionString);

            var mongoDatabase = mongoClient.GetDatabase(
                foodServiceDatabaseSettings.Value.DatabaseName);

            _foodsCollection = mongoDatabase.GetCollection<Food>(
                foodServiceDatabaseSettings.Value.FoodCollectionName);
        }
        // GET
        public async Task<List<Food>> GetAllAsync() => await _foodsCollection.Find(_ => true).ToListAsync();
        public async Task<Food> GetAsync(string id) => await _foodsCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        public async Task<List<Food>> GetByMaxCaloriesAsync(double maxCalories) => await _foodsCollection.Find(f => f.Calories < maxCalories).ToListAsync();
        public async Task<List<Food>> GetByExcludedAllergensAsync(List<string> excludedAllergens)
        {
            var lowerCaseExcludedAllergens = excludedAllergens.Select(allergen => allergen.ToLower()).ToList();

            return await _foodsCollection
                .Find(f => !f.Allergens.Any(allergen => lowerCaseExcludedAllergens.Contains(allergen.ToLower())))
                .ToListAsync();
        }
        // POST
        public async Task CreateAsync(Food food) => await _foodsCollection.InsertOneAsync(food);
        public async Task CreateManyAsync(List<Food> foods) => await _foodsCollection.InsertManyAsync(foods);
        // PUT
        public async Task UpdateAsync(string id, Food updateFood) => await _foodsCollection.ReplaceOneAsync(p => p.Id == id, updateFood);
        // DELETE
        public async Task DeleteAsync(string id) => await _foodsCollection.DeleteOneAsync(p => p.Id == id);
        public async Task<DeleteResult> DeleteByNameAsync(string name)
        {
            return await _foodsCollection.DeleteManyAsync(f => f.Name == name);
        }
    }
}