using RecipeService.Models;

namespace RecipeService.Integration
{
    public class NutrtionResponse
    {
        public string Name { get; set; }
        public Nutrition TotalNutrition { get; set; }
        public Nutrition NutritionPerServing { get; set; }
        public List<string> Tags { get; set; }

    }
}
