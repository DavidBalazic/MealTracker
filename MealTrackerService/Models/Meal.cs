using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MealTrackerService.Models
{
    public class Meal
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Name { get; set; }
        public List<FoodItem> FoodItems { get; set; } = new List<FoodItem>();
        public int Calories { get; set; }
    }
}