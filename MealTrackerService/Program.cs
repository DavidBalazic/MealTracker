using MealTrackerService.Data;
using Microsoft.Extensions.Options;
using MealTrackerService.Models;
using MongoDB.Driver;

namespace MealTrackerService
{
    public class Program
    {
        public static void Main(string[] args)
        {
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
            builder.Services.Configure<MongoSettings>(
                builder.Configuration.GetSection("MongoSettings"));

            builder.Services.AddSingleton<IMongoSettings>(sp =>
                sp.GetRequiredService<IOptions<MongoSettings>>().Value);

            builder.Services.AddSingleton<MongoClient>(s =>
                new MongoClient(builder.Configuration["MongoSettings:ConnectionString"]));

            builder.Services.AddScoped<IMealTrackerContext, MealTrackerContext>();

            // Register HTTP Clients
            builder.Services.AddHttpClient<MealTrackerService.Services.FoodServiceClient>(client =>
            {
                client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:FoodService"]);
            });

            builder.Services.AddHttpClient<MealTrackerService.Services.UserServiceClient>(client =>
            {
                client.BaseAddress = new Uri(builder.Configuration["ServiceUrls:UserService"]);
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
            app.UseAuthorization();
            app.MapControllers(); // Enable controller-based routing

            app.Run();
        }
    }
}
