using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace MealTrackerService.Models
{
    public class UserHealth
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public int UserId { get; set; }
        public int DailyCalorieTarget { get; set; }
        public int WeeklyCalorieTarget { get; set; }
    }
}