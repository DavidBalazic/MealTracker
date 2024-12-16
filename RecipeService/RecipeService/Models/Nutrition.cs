using MongoDB.Bson.Serialization.Attributes;

namespace RecipeService.Models
{
    public class Nutrition
    {
        [BsonElement("calories")]
        public double Calories { get; set; }

        [BsonElement("protein")]
        public double Protein { get; set; }

        [BsonElement("carbohydrates")]
        public double Carbohydrates { get; set; }

        [BsonElement("fat")]
        public double Fat { get; set; }
    }
}