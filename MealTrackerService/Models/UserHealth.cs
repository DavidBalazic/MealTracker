namespace MealTrackerService.Models
{
    public class UserHealth
    {
        public int UserId { get; set; }
        public int DailyCalorieTarget { get; set; }
        public int WeeklyCalorieTarget { get; set; }
    }
}