namespace FoodService.DTOs
{
    public class FoodDto
    {
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
