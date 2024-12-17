using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace RecipeService.Models
{
    public class Recipe
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string? Id { get; set; }

        [BsonElement("name")]
        public string Name { get; set; }

        [BsonElement("ingredients")]
        public List<Ingredient> Ingredients { get; set; }

        [BsonElement("totalNutrition")]
        public Nutrition TotalNutrition { get; set; }

        [BsonElement("servings")]
        public int Servings { get; set; }

        [BsonElement("instructions")]
        public string Instructions { get; set; }

        [BsonElement("tags")]
        public List<string> Tags { get; set; }
    }
}