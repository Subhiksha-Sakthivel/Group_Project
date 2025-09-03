using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using YourNamespace.Models;

namespace YourNamespace.Services
{
    public interface IDataCleanupService
    {
        Task CleanupAndReseedAsync();
    }

    public class DataCleanupService : IDataCleanupService
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly ILogger<DataCleanupService> _logger;

        public DataCleanupService(
            IAmazonDynamoDB dynamoDbClient,
            ILogger<DataCleanupService> logger)
        {
            _dynamoDbClient = dynamoDbClient;
            _logger = logger;
        }

        public async Task CleanupAndReseedAsync()
        {
            try
            {
                _logger.LogInformation("Starting data cleanup and reseed process...");

                // Delete the existing table
                await DeleteTableIfExistsAsync("Mappings");
                
                // Wait a moment for deletion to complete
                await Task.Delay(2000);
                
                // Create a new clean table
                await CreateCleanMappingsTableAsync();
                
                // Seed with clean data
                await SeedCleanMappingsDataAsync();
                
                _logger.LogInformation("Data cleanup and reseed completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during data cleanup and reseed");
                throw;
            }
        }

        private async Task DeleteTableIfExistsAsync(string tableName)
        {
            try
            {
                var response = await _dynamoDbClient.DescribeTableAsync(new DescribeTableRequest
                {
                    TableName = tableName
                });
                
                if (response.Table.TableStatus == TableStatus.ACTIVE)
                {
                    _logger.LogInformation("Deleting existing Mappings table...");
                    await _dynamoDbClient.DeleteTableAsync(new DeleteTableRequest { TableName = tableName });
                    
                    // Wait for deletion to complete
                    do
                    {
                        await Task.Delay(1000);
                        try
                        {
                            await _dynamoDbClient.DescribeTableAsync(new DescribeTableRequest { TableName = tableName });
                        }
                        catch (ResourceNotFoundException)
                        {
                            break; // Table deleted successfully
                        }
                    } while (true);
                    
                    _logger.LogInformation("Mappings table deleted successfully.");
                }
            }
            catch (ResourceNotFoundException)
            {
                _logger.LogInformation("Mappings table does not exist, nothing to delete.");
            }
        }

        private async Task CreateCleanMappingsTableAsync()
        {
            _logger.LogInformation("Creating new clean Mappings table...");
            
            var createTableRequest = new CreateTableRequest
            {
                TableName = "Mappings",
                AttributeDefinitions = new List<AttributeDefinition>
                {
                    new AttributeDefinition
                    {
                        AttributeName = "Id",
                        AttributeType = ScalarAttributeType.S
                    }
                },
                KeySchema = new List<KeySchemaElement>
                {
                    new KeySchemaElement
                    {
                        AttributeName = "Id",
                        KeyType = KeyType.HASH
                    }
                },
                ProvisionedThroughput = new ProvisionedThroughput
                {
                    ReadCapacityUnits = 5,
                    WriteCapacityUnits = 5
                }
            };

            await _dynamoDbClient.CreateTableAsync(createTableRequest);

            // Wait for table to be active
            var describeRequest = new DescribeTableRequest { TableName = "Mappings" };
            TableStatus status;
            do
            {
                await Task.Delay(1000);
                var response = await _dynamoDbClient.DescribeTableAsync(describeRequest);
                status = response.Table.TableStatus;
            } while (status != TableStatus.ACTIVE);

            _logger.LogInformation("Clean Mappings table created successfully.");
        }

        private async Task SeedCleanMappingsDataAsync()
        {
            try
            {
                // Read the Mappings.json file
                var jsonPath = Path.Combine(Directory.GetCurrentDirectory(), "Data", "Mappings.json");
                if (!File.Exists(jsonPath))
                {
                    _logger.LogWarning("Mappings.json file not found at {Path}", jsonPath);
                    return;
                }

                var jsonContent = await File.ReadAllTextAsync(jsonPath);
                var mappings = JsonSerializer.Deserialize<List<Mapping>>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (mappings == null || !mappings.Any())
                {
                    _logger.LogWarning("No mappings found in Mappings.json");
                    return;
                }

                // Convert to DynamoDB items with clean data (no NULL values)
                var items = mappings.Select(mapping => new Dictionary<string, AttributeValue>
                {
                    ["Id"] = new AttributeValue { S = mapping.Id ?? string.Empty },
                    ["Operation"] = new AttributeValue { S = mapping.Operation ?? string.Empty },
                    ["Version"] = new AttributeValue { N = mapping.Version.ToString() },
                    ["Status"] = new AttributeValue { S = mapping.Status ?? string.Empty },
                    ["LastModified"] = new AttributeValue { S = mapping.LastModified ?? DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") },
                    ["IsDeleted"] = new AttributeValue { BOOL = mapping.IsDeleted },
                    ["DeletedAt"] = !string.IsNullOrEmpty(mapping.DeletedAt) 
                        ? new AttributeValue { S = mapping.DeletedAt }
                        : new AttributeValue { S = string.Empty }, // Use empty string instead of NULL
                    ["Soap"] = mapping.Soap != null 
                        ? new AttributeValue { S = JsonSerializer.Serialize(mapping.Soap) }
                        : new AttributeValue { S = string.Empty }, // Use empty string instead of NULL
                    ["Rest"] = mapping.Rest != null 
                        ? new AttributeValue { S = JsonSerializer.Serialize(mapping.Rest) }
                        : new AttributeValue { S = string.Empty }, // Use empty string instead of NULL
                    ["RestSource"] = mapping.RestSource != null 
                        ? new AttributeValue { S = JsonSerializer.Serialize(mapping.RestSource) }
                        : new AttributeValue { S = string.Empty }, // Use empty string instead of NULL
                    ["RestDestination"] = mapping.RestDestination != null 
                        ? new AttributeValue { S = JsonSerializer.Serialize(mapping.RestDestination) }
                        : new AttributeValue { S = string.Empty } // Use empty string instead of NULL
                }).ToList();

                // Batch write items (DynamoDB batch write limit is 25 items)
                const int batchSize = 25;
                for (int i = 0; i < items.Count; i += batchSize)
                {
                    var batch = items.Skip(i).Take(batchSize).ToList();
                    var writeRequests = batch.Select(item => new WriteRequest
                    {
                        PutRequest = new PutRequest { Item = item }
                    }).ToList();

                    var batchRequest = new BatchWriteItemRequest
                    {
                        RequestItems = new Dictionary<string, List<WriteRequest>>
                        {
                            ["Mappings"] = writeRequests
                        }
                    };

                    await _dynamoDbClient.BatchWriteItemAsync(batchRequest);
                }

                _logger.LogInformation("Successfully seeded {Count} clean mappings into DynamoDB", mappings.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding clean mappings data");
                throw;
            }
        }
    }
}
