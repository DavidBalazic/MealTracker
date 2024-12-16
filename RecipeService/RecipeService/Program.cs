using RecipeService.Models;
using RecipeService.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.Configure<RecipeServiceDatabaseSettings>(options =>
{
    options.ConnectionString = builder.Configuration["MongoDB:ConnectionString"];
    options.DatabaseName = builder.Configuration["RecipeServiceDatabase:DatabaseName"];
    options.RecipeCollectionName = builder.Configuration["RecipeServiceDatabase:RecipeCollectionName"];
});
builder.Services.AddSingleton<RecipesService>();
builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.PropertyNamingPolicy = null);
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

app.UseAuthorization();

app.MapControllers();

app.Run();
