using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using FoodServiceClient; // Import the Food class

namespace MealTrackerService.Models
{
    public class Meal
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Name { get; set; }
        
        // This property stores the IDs of foods linked to this meal
        public List<string> FoodIds { get; set; } = new List<string>(); 
        
        [BsonIgnore]
        public List<Food> Foods { get; set; } = new List<Food>(); // Resolved at runtime from FoodService

        public int Calories { get; set; }
    }
}