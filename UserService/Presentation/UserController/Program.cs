using MongoDB.Driver;
using UserServices.Impl.Models;
using UserServices.Impl.Implementation;
using UserServices.Impl.Interfaces;
using Microsoft.OpenApi.Models;

internal class Program
{
  private static void Main(string[] args)
  {
    var builder = WebApplication.CreateBuilder(args);

    // Configure services
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(options =>
    {
      options.SwaggerDoc("v1", new OpenApiInfo
      {
        Version = "v1",
        Title = "User Service API",
        Description = "An API for managing users, authentication, and sessions"
      });

      options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
      {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter 'Bearer' [space] and then your valid token in the text input below."
      });

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
    builder.Services.AddSingleton<IMongoClient, MongoClient>(sp =>
    {
      var configuration = sp.GetRequiredService<IConfiguration>();
      var connectionString = configuration["MongoDB:ConnectionString"];
      return new MongoClient(connectionString);
    });

    builder.Services.AddSingleton<IUserService, UserService>();
    builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

    var app = builder.Build();

    // Configure middleware
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
  }
}