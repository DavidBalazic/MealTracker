using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MealTrackerService.Models
{
    public class MealPlan
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        public DateTime Date { get; set; }
        public List<Meal> Meals { get; set; } = new List<Meal>();
    }
}
