// using Amazon.DynamoDBv2;
// using Amazon.DynamoDBv2.DataModel;

// var builder = WebApplication.CreateBuilder(args);

// // Add services to the container.

// builder.Services.AddControllers();
// // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen();
// var awsOptions = builder.Configuration.GetAWSOptions();
// builder.Services.AddDefaultAWSOptions(awsOptions);

// builder.Services.AddAWSService<IAmazonDynamoDB>();
// builder.Services.AddScoped<IDynamoDBContext, DynamoDBContext>();
// var app = builder.Build();

// // Configure the HTTP request pipeline.
// if (app.Environment.IsDevelopment())
// {
//     app.UseSwagger();
//     app.UseSwaggerUI();
// }

// app.UseHttpsRedirection();

// app.UseAuthorization();

// app.MapControllers();

// app.Run();

using Amazon;
using Amazon.DynamoDBv2;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using YourNamespace.Repositories;
using YourNamespace.Services;
using Amazon.Runtime;

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Read flag from configuration (appsettings.json or environment)
bool useMockRepo = configuration.GetValue<bool>("UseMockRepository");

if (!useMockRepo)
{
    // AWS DynamoDB configuration (real implementation)
    // builder.Services.AddDefaultAWSOptions(configuration.GetAWSOptions());
    // builder.Services.AddAWSService<IAmazonDynamoDB>();
    builder.Services.AddSingleton<IAmazonDynamoDB>(sp =>
    {
        var localEndpoint = configuration.GetValue<string>("DynamoDB:LocalEndpoint") ?? "http://localhost:8000";
        var config = new AmazonDynamoDBConfig
        {
            ServiceURL = localEndpoint
        };

        var credentials = new BasicAWSCredentials("fakeMyKeyId", "fakeSecretKey");
        return new AmazonDynamoDBClient(credentials, config);
    });

    builder.Services.AddSingleton<IMappingRepository, MappingRepository>();
    
    // Add DynamoDB initializer service
    builder.Services.AddSingleton<IDynamoDBInitializerService, DynamoDBInitializerService>();
    
    // Add data cleanup service
    builder.Services.AddSingleton<IDataCleanupService, DataCleanupService>();
}
else
{
    // Mock implementation registration
    builder.Services.AddSingleton<IMappingRepository, MockMappingRepository>();
}

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
            if (builder.Environment.IsDevelopment())
            {
                // In development, allow all origins for easier testing
                policy.AllowAnyOrigin()
                      .AllowAnyHeader()
                      .AllowAnyMethod();
            }
            else
            {
                // In production, restrict to specific origins
                policy.WithOrigins(
                    "http://localhost:5173",    // React dev server
                    "http://localhost:7214",    // HTTP API port
                    "http://localhost:5214",    // HTTP API port
                    "https://localhost:7214",   // HTTPS API port
                    "https://localhost:5214"    // HTTPS API port
                )
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
            }
        });
});

var app = builder.Build();

// Initialize DynamoDB if not using mock repository
if (!useMockRepo)
{
    try
    {
        using var scope = app.Services.CreateScope();
        var initializer = scope.ServiceProvider.GetRequiredService<IDynamoDBInitializerService>();
        
        // Add timeout to prevent hanging
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(30));
        await initializer.InitializeAsync();
        
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogInformation("DynamoDB initialization completed successfully.");
    }
    catch (Exception ex)
    {
        var logger = app.Services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Failed to initialize DynamoDB. Application will continue but may not function properly.");
    }
}

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

