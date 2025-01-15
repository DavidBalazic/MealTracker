using FoodService.Models;
using FoodService.Services;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi.Models;
using MongoDB.Driver;
using System.Reflection;

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
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Foods API",
        Version = "v1",
        Description = "API za upravljanje s podatki o hrani."
    });

    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(Path.Combine(AppContext.BaseDirectory, xmlFilename));
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Foods API v1");
    });
}

app.UseHttpsRedirection();

// Apply the CORS policy
app.UseCors("AllowFrontend");

app.UseAuthorization();

app.MapControllers();

app.Run();
