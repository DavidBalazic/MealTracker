using MealTrackerService.Data;
using Microsoft.Extensions.Options;
using MealTrackerService.Models;
using MongoDB.Driver;
using dotenv.net;
using FoodServiceClient;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

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
            builder.Services.AddControllers(); // Add controllers for CRUD operations
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

                // Add Bearer token authentication for Swagger
                options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                {
                    Name = "Authorization",
                    Type = SecuritySchemeType.Http,
                    Scheme = "Bearer",
                    BearerFormat = "JWT",
                    In = ParameterLocation.Header,
                    Description = "Enter your valid JWT token below."
                });

                // Require Bearer token for secured endpoints
                options.AddSecurityRequirement(new OpenApiSecurityRequirement
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });

                // Include XML comments in Swagger
                var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
                var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
                options.IncludeXmlComments(xmlPath);
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
            builder.Services.AddHttpClient<FoodServiceClient.FoodServiceClient>((serviceProvider, client) =>
            {
                var baseUrl = Environment.GetEnvironmentVariable("FOOD_SERVICE_URL");
                if (string.IsNullOrEmpty(baseUrl))
                {
                    throw new InvalidOperationException("FOOD_SERVICE_URL is not set in environment variables.");
                }
                client.BaseAddress = new Uri(baseUrl);
            }).AddTypedClient((httpClient, serviceProvider) =>
            {
                var baseUrl = Environment.GetEnvironmentVariable("FOOD_SERVICE_URL");
                return new FoodServiceClient.FoodServiceClient(baseUrl!, httpClient);
            });

            // Configure CORS
            var reactAppUrl = Environment.GetEnvironmentVariable("REACT_APP_URL");

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowReactApp", policy =>
                {
                    policy.WithOrigins(reactAppUrl) // Allow React frontend
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
           .AddJwtBearer(options =>
           {
               options.TokenValidationParameters = new TokenValidationParameters
               {
                   ValidateIssuerSigningKey = true,
                   IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]!)),
                   ValidateIssuer = true,
                   ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                   ValidateAudience = false, // Adjust if needed
                   ClockSkew = TimeSpan.Zero
               };
           });

            var app = builder.Build();


            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Meal Tracker API v1");
                options.RoutePrefix = string.Empty; // Swagger served at root URL
            });


            app.UseHttpsRedirection();

            // Enable CORS
            app.UseCors("AllowReactApp");

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers(); // Enable controller-based routing

            app.Run();
        }
    }
}
