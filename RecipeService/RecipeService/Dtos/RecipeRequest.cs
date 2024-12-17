using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using RecipeService.Models;

namespace RecipeService.Dtos
{
    public class RecipeRequest
    {
        public string? Id { get; set; }

        public string Name { get; set; }

        public List<Ingredient> Ingredients { get; set; }

        public int Servings { get; set; }

        public string Instructions { get; set; }

        public List<string> Tags { get; set; }
    }
}
