using MongoDB.Bson.IO;
using RecipeService.Integration;
using RecipeService.Models;
using System.Diagnostics;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using Newtonsoft.Json;

namespace RecipeService.Services
{
    public class NutritionService
    {
        private readonly HttpClient _client;

        public NutritionService(HttpClient client)
        {
            _client = client;
        }

        public async Task<NutrtionResponse?> GetNutritionAsync(Recipe recipe)
        {
            var response = await _client.PostAsJsonAsync("/process-recipe", recipe);
            if (!response.IsSuccessStatusCode) return null;
            var nutrtionResponse = await response.Content.ReadFromJsonAsync<NutrtionResponse>();
            return nutrtionResponse;
        }
    }
}
