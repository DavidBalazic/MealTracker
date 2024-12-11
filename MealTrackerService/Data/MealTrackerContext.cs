using MongoDB.Driver;
using MealTrackerService.Models;

namespace MealTrackerService.Data
{
    public class MealTrackerContext : IMealTrackerContext
    {
        private readonly IMongoDatabase _database;

        public MealTrackerContext(IMongoSettings settings)
        {
            if (settings == null)
            {
                throw new ArgumentNullException(nameof(settings), "MongoSettings cannot be null");
            }

            if (string.IsNullOrEmpty(settings.ConnectionString))
            {
                throw new ArgumentException("Connection string is missing in MongoSettings");
            }

            if (string.IsNullOrEmpty(settings.DatabaseName))
            {
                throw new ArgumentException("Database name is missing in MongoSettings");
            }

            var client = new MongoClient(settings.ConnectionString);
            _database = client.GetDatabase(settings.DatabaseName);
        }

        public IMongoCollection<MealPlan> MealPlans => _database.GetCollection<MealPlan>("MealPlans");
        public IMongoCollection<Meal> Meals => _database.GetCollection<Meal>("Meals");
        public IMongoCollection<FoodItem> FoodItems => _database.GetCollection<FoodItem>("FoodItems");
    }

    public interface IMealTrackerContext
    {
        IMongoCollection<MealPlan> MealPlans { get; }
        IMongoCollection<Meal> Meals { get; }
        IMongoCollection<FoodItem> FoodItems { get; }
    }
}
