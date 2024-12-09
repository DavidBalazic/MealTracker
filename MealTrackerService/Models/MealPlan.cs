namespace MealTrackerService.Models
{
    public class MealPlan
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public List<Meal> Meals { get; set; } = new List<Meal>();
    }
}