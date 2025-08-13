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

var builder = WebApplication.CreateBuilder(args);

var configuration = builder.Configuration;

// Read flag from configuration (appsettings.json or environment)
bool useMockRepo = configuration.GetValue<bool>("UseMockRepository");

if (!useMockRepo)
{
    // AWS DynamoDB configuration (real implementation)
    builder.Services.AddDefaultAWSOptions(configuration.GetAWSOptions());
    builder.Services.AddAWSService<IAmazonDynamoDB>();
    builder.Services.AddScoped<IMappingRepository, MappingRepository>();
}
else
{
    // Mock implementation registration
    builder.Services.AddScoped<IMappingRepository, MockMappingRepository>();
}

builder.Services.AddScoped<IMappingService, MappingService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.MapControllers();

app.Run();

