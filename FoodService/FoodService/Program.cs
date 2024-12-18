using FoodService.Models;
using FoodService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.Configure<FoodServiceDatabaseSettings>(options =>
{
    options.ConnectionString = builder.Configuration["MongoDB:ConnectionString"];
    options.DatabaseName = builder.Configuration["FoodServiceDatabase:DatabaseName"];
    options.FoodCollectionName = builder.Configuration["FoodServiceDatabase:FoodCollectionName"];
});
builder.Services.AddSingleton<FoodsService>();
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);

// Add CORS services
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        // Retrieve the allowed origin from configuration
        var allowedOrigin = builder.Configuration["AllowedOrigins:Frontend"];
        policy.WithOrigins(allowedOrigin)
            .AllowAnyHeader()
            .AllowAnyMethod();
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

// Apply the CORS policy
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
