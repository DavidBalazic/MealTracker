using MongoDB.Driver;
using UserServices.Impl.Models;
using UserServices.Impl.Implementation;
using UserServices.Impl.Interfaces;
using Microsoft.OpenApi.Models;
using Microsoft.Extensions.Options;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

internal class Program
{
    private static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Configure services
        builder.Services.AddControllers();

        // Configure CORS
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowSpecificOrigins", policy =>
            {
                policy.WithOrigins("http://localhost:3000") // Allow requests from the frontend
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            });
        });

        // Configure Swagger for API documentation
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Version = "v1",
                Title = "User Service API",
                Description = "An API for managing users, authentication, and sessions"
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
        });

        // Bind MongoDB settings from configuration
        builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDB"));

        // Register MongoClient with DI
        builder.Services.AddSingleton<IMongoClient>(sp =>
        {
            var mongoDbSettings = sp.GetRequiredService<IOptions<MongoDbSettings>>().Value;

            // Ensure connection string is valid
            if (string.IsNullOrEmpty(mongoDbSettings.ConnectionString))
            {
                throw new ArgumentNullException(nameof(mongoDbSettings.ConnectionString), "MongoDB connection string is not configured properly in appsettings.json.");
            }

            return new MongoClient(mongoDbSettings.ConnectionString);
        });

        // Register UserService with DI
        builder.Services.AddSingleton<IUserService, UserService>();

        // Configure JWT settings
        builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

        // Configure JWT authentication
        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(builder.Configuration["JwtSettings:Secret"]!)),
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
                    ValidateAudience = false, // Optional: Can add audience validation if needed
                    ClockSkew = TimeSpan.Zero // Eliminate token expiry grace period
                };
            });

        var app = builder.Build();

        // Enable Swagger for development and testing
        app.UseSwagger();
        app.UseSwaggerUI();

        // Use CORS middleware
        app.UseCors("AllowSpecificOrigins");

        // Configure middleware
        app.UseAuthentication(); // Add authentication middleware
        app.UseAuthorization();  // Add authorization middleware

        // Map controller endpoints
        app.MapControllers();

        // Run the application
        app.Run();
    }
}
