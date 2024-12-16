using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace RecipeService.Models
{
    public class Ingredient
    {
        [BsonElement("foodId")]
        [BsonRepresentation(BsonType.ObjectId)]
        public string FoodId { get; set; }

        [BsonElement("quantity")]
        public double Quantity { get; set; } // grams or servings
    }
}