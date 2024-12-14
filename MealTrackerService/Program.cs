using MealTrackerService.Data;
using Microsoft.Extensions.Options;
using MealTrackerService.Models;
using MongoDB.Driver;
using dotenv.net;

namespace MealTrackerService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Load environment variables from .env file
            DotEnv.Load();

            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers(); // Add controllers for potential CRUD operations
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Meal Tracker API",
                    Version = "v1",
                    Description = "API documentation for the Meal Tracker Service",
                    Contact = new Microsoft.OpenApi.Models.OpenApiContact
                    {
                        Name = "Your Name",
                        Email = "your.email@example.com"
                    }
                });
            });

            // Configure MongoDB
            builder.Services.Configure<MongoSettings>(options =>
            {
                options.ConnectionString = Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")!;
                options.DatabaseName = Environment.GetEnvironmentVariable("MONGO_DATABASE_NAME")!;
            });

            builder.Services.AddSingleton<IMongoSettings>(sp =>
                sp.GetRequiredService<IOptions<MongoSettings>>().Value);

            builder.Services.AddSingleton<MongoClient>(s =>
                new MongoClient(Environment.GetEnvironmentVariable("MONGO_CONNECTION_STRING")));

            builder.Services.AddScoped<IMealTrackerContext, MealTrackerContext>();

            // Register HTTP Clients
            builder.Services.AddHttpClient<MealTrackerService.Services.FoodServiceClient>(client =>
            {
                client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("FOOD_SERVICE_URL")!);
            });

            builder.Services.AddHttpClient<MealTrackerService.Services.UserServiceClient>(client =>
            {
                client.BaseAddress = new Uri(Environment.GetEnvironmentVariable("USER_SERVICE_URL")!);
            });

            // Configure CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins(Environment.GetEnvironmentVariable("REACT_APP_URL")!) // Replace with your React app's URL
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "Meal Tracker API v1");
                    options.RoutePrefix = string.Empty; // Swagger will be served at the root URL
                });
            }

            app.UseHttpsRedirection();

            // Enable CORS
            app.UseCors("AllowReactApp");

            app.UseAuthorization();
            app.MapControllers(); // Enable controller-based routing

            app.Run();
        }
    }
}
