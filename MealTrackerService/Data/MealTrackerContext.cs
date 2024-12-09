using Microsoft.EntityFrameworkCore;
using MealTrackerService.Models;

namespace MealTrackerService.Data
{
    public class MealTrackerContext : DbContext
    {
        public MealTrackerContext(DbContextOptions<MealTrackerContext> options) : base(options) { }

        public DbSet<Meal> Meals { get; set; }
        public DbSet<MealPlan> MealPlans { get; set; }
        public DbSet<FoodItem> FoodItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Example configurations if needed
            modelBuilder.Entity<Meal>().HasMany(m => m.FoodItems).WithOne().OnDelete(DeleteBehavior.Cascade);
            modelBuilder.Entity<MealPlan>().HasMany(mp => mp.Meals).WithOne().OnDelete(DeleteBehavior.Cascade);
        }
    }
}