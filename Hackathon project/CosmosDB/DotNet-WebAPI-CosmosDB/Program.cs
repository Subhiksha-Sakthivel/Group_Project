using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using YourNamespace.Repositories;
using YourNamespace.Services;

// Uncomment when Cosmos DB SDK is ready
// using Microsoft.Azure.Cosmos;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Read flag from configuration (appsettings.json or environment)
bool useMockRepo = configuration.GetValue<bool>("UseMockRepository");

if (!useMockRepo)
{
    // Cosmos DB configuration (commented until real connection is set up)
    /*
    var cosmosConnectionString = configuration.GetConnectionString("CosmosDb");
    var cosmosClient = new CosmosClient(cosmosConnectionString);
    builder.Services.AddSingleton(cosmosClient);
    builder.Services.AddSingleton<IMappingRepository, CosmosMappingRepository>();
    */
}
else
{
    // Mock implementation registration
    builder.Services.AddSingleton<IMappingRepository, MockMappingRepository>();
}

// Register MappingService (depends on repo)
builder.Services.AddSingleton<IMappingService, MappingService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add CORS policy
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // your React dev server
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// Enable CORS
app.UseCors("AllowReactApp");

app.UseHttpsRedirection();

app.MapControllers();

app.Run();
