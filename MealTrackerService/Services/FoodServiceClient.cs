using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using MealTrackerService.Models;

namespace MealTrackerService.Services
{
    public class FoodServiceClient
    {
        private readonly HttpClient _httpClient;

        public FoodServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Fetch details of a food item by ID
        public async Task<FoodItem> GetFoodItemAsync(int foodItemId)
        {
            var response = await _httpClient.GetAsync($"http://foodservice/api/food/{foodItemId}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<FoodItem>();
        }

        // Additional methods to interact with the Food Service can be added here
    }
}