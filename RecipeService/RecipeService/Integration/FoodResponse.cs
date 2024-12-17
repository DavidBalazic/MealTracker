using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;

namespace RecipeService.Integration
{
    public class FoodResponse
    {
        public string? Id { get; set; }

        public string Name { get; set; }

        public double Calories { get; set; }

        public double Protein { get; set; }

        public double Carbohydrates { get; set; }

        public double Fat { get; set; }
        public int ServingSize { get; set; }

        public string Unit { get; set; }

        public List<string> Allergens { get; set; }
    }
}
