namespace MealTrackerService.Models
{
    public class Meal
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public List<FoodItem> FoodItems { get; set; } = new List<FoodItem>();
        public int Calories { get; set; }
    }
}