namespace FoodService.Models
{
    public class FoodServiceDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;

        public string DatabaseName { get; set; } = null!;

        public string FoodCollectionName { get; set; } = null!;
    }
}