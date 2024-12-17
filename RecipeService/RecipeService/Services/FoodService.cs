using RecipeService.Integration;
using System.Globalization;

namespace RecipeService.Services
{
    public class FoodService
    {
        private readonly HttpClient _client;

        public FoodService(HttpClient client)
        {
            _client = client;
        }

        public async Task<FoodResponse?> GetFoodAsync(string id)
        {
            var response = await _client.GetAsync($"/api/Foods/{id}");
            if (!response.IsSuccessStatusCode) return null;
            var food = await response.Content.ReadFromJsonAsync<FoodResponse>();
            return food;
        }
    }
}
