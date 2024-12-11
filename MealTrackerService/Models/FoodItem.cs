using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MealTrackerService.Models
{
    public class FoodItem
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } // MongoDB uses string ObjectId

        public string Name { get; set; }
        public int Calories { get; set; }
    }
}