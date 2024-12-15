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

        public async Task<List<Food>> GetAsync() => await _foodsCollection.Find(_ => true).ToListAsync();
        public async Task<Food> GetAsync(string id) => await _foodsCollection.Find(p => p.Id == id).FirstOrDefaultAsync();
        public async Task CreateAsync(Food food) => await _foodsCollection.InsertOneAsync(food);
        public async Task UpdateAsync(string id, Food updateFood) => await _foodsCollection.ReplaceOneAsync(p => p.Id == id, updateFood);
        public async Task DeleteAsync(string id) => await _foodsCollection.DeleteOneAsync(p => p.Id == id);
    }
}