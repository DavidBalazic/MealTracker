using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FoodService.Models
{
    public class Food
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("calories")]
        public double Calories { get; set; }

        [BsonElement("protein")]
        public double Protein { get; set; }

        [BsonElement("carbohydrates")]
        public double Carbohydrates { get; set; }

        [BsonElement("fat")]
        public double Fat { get; set; }

        [BsonElement("servingSize")]
        public string ServingSize { get; set; }

        [BsonElement("allergens")]
        public List<string> Allergens { get; set; }
    }
}