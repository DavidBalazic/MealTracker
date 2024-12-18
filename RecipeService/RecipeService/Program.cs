using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using RecipeService.Models;
using RecipeService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddHttpClient<FoodService>((serviceProvider, client) =>
{
    var configuration = serviceProvider.GetRequiredService<IConfiguration>();
    var baseAddress = configuration["Services:FoodService:BaseAddress"];
    client.BaseAddress = new Uri(baseAddress);
});

builder.Services.Configure<RecipeServiceDatabaseSettings>(options =>
{
    options.ConnectionString = builder.Configuration["MongoDB:ConnectionString"];
    options.DatabaseName = builder.Configuration["RecipeServiceDatabase:DatabaseName"];
    options.RecipeCollectionName = builder.Configuration["RecipeServiceDatabase:RecipeCollectionName"];
});

builder.Services.AddSingleton<RecipesService>();

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactFrontend",
        policy =>
        {
            var allowedOrigin = builder.Configuration["AllowedOrigins:Frontend"];
            if (!string.IsNullOrEmpty(allowedOrigin))
            {
                policy.WithOrigins(allowedOrigin) // Fetch from appsettings.json
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            else
            {
                throw new InvalidOperationException("AllowedOrigins:Frontend is not configured.");
            }
        });
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Apply CORS policy
app.UseCors("AllowReactFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
