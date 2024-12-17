namespace RecipeService.Models
{
    public class RecipeServiceDatabaseSettings
    {
        public string ConnectionString { get; set; } = null!;

        public string DatabaseName { get; set; } = null!;

        public string RecipeCollectionName { get; set; } = null!;
    }
}