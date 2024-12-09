using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using MealTrackerService.Models;

namespace MealTrackerService.Services
{
    public class UserServiceClient
    {
        private readonly HttpClient _httpClient;

        public UserServiceClient(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        // Fetch user health data by user ID
        public async Task<UserHealth> GetUserHealthAsync(int userId)
        {
            var response = await _httpClient.GetAsync($"http://userservice/api/userhealth/{userId}");
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<UserHealth>();
        }

        // Additional methods to interact with the User Service can be added here
    }
}