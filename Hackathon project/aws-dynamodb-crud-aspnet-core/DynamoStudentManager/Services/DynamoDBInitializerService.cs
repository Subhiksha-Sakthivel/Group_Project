using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using YourNamespace.Models;

namespace YourNamespace.Services
{
    public interface IDynamoDBInitializerService
    {
        Task InitializeAsync();
    }

    public class DynamoDBInitializerService : IDynamoDBInitializerService
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly ILogger<DynamoDBInitializerService> _logger;
        private readonly IConfiguration _configuration;

        public DynamoDBInitializerService(
            IAmazonDynamoDB dynamoDbClient,
            ILogger<DynamoDBInitializerService> logger,
            IConfiguration configuration)
        {
            _dynamoDbClient = dynamoDbClient;
            _logger = logger;
            _configuration = configuration;
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Starting DynamoDB initialization...");

                // Check if table exists with timeout
                var tableExists = await TableExistsAsync("Mappings");
                
                if (!tableExists)
                {
                    _logger.LogInformation("Creating Mappings table...");
                    await CreateMappingsTableAsync();
                }
                else
                {
                    _logger.LogInformation("Mappings table already exists.");
                }

                // Skip data seeding for now to speed up startup
                _logger.LogInformation("Skipping data seeding for faster startup...");
                // await ClearTableDataAsync();
                // await SeedMappingsDataAsync();

                _logger.LogInformation("DynamoDB initialization completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during DynamoDB initialization");
                // Don't throw - let the app continue
                _logger.LogWarning("Continuing without full DynamoDB initialization...");
            }
        }

        private async Task<bool> TableExistsAsync(string tableName)
        {
            try
            {
                using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
                var response = await _dynamoDbClient.DescribeTableAsync(new DescribeTableRequest
                {
                    TableName = tableName
                }, cts.Token);
                return response.Table.TableStatus == TableStatus.ACTIVE;
            }
            catch (ResourceNotFoundException)
            {
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Error checking if table exists, assuming it doesn't");
                return false;
            }
        }

        private async Task CreateMappingsTableAsync()
        {
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
                await Task.Delay(1000); // Wait 1 second
                var response = await _dynamoDbClient.DescribeTableAsync(describeRequest);
                status = response.Table.TableStatus;
            } while (status != TableStatus.ACTIVE);

            _logger.LogInformation("Mappings table created successfully.");
        }



        private async Task SeedMappingsDataAsync()
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

                // Convert to DynamoDB items and batch write
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
                                : new AttributeValue { NULL = true },
                                                                    ["Soap"] = mapping.Soap != null 
                        ? new AttributeValue { M = new Dictionary<string, AttributeValue>
                            {
                                ["Endpoint"] = new AttributeValue { S = mapping.Soap.Endpoint ?? string.Empty },
                                ["Headers"] = new AttributeValue { S = mapping.Soap.Headers ?? string.Empty },
                                ["RequestPayload"] = new AttributeValue { S = mapping.Soap.RequestPayload ?? string.Empty },
                                ["ResponsePayload"] = new AttributeValue { S = mapping.Soap.ResponsePayload ?? string.Empty }
                            }
                        }
                        : new AttributeValue { NULL = true },
                    ["Rest"] = mapping.Rest != null 
                        ? new AttributeValue { M = new Dictionary<string, AttributeValue>
                            {
                                ["Endpoint"] = new AttributeValue { S = mapping.Rest.Endpoint ?? string.Empty },
                                ["Headers"] = new AttributeValue { S = mapping.Rest.Headers ?? string.Empty },
                                ["RequestPayload"] = new AttributeValue { S = mapping.Rest.RequestPayload ?? string.Empty },
                                ["ResponsePayload"] = new AttributeValue { S = mapping.Rest.ResponsePayload ?? string.Empty }
                            }
                        }
                        : new AttributeValue { NULL = true },
                    ["RestSource"] = mapping.RestSource != null 
                        ? new AttributeValue { M = new Dictionary<string, AttributeValue>
                            {
                                ["Endpoint"] = new AttributeValue { S = mapping.RestSource.Endpoint ?? string.Empty },
                                ["Headers"] = new AttributeValue { S = mapping.RestSource.Headers ?? string.Empty },
                                ["RequestPayload"] = new AttributeValue { S = mapping.RestSource.RequestPayload ?? string.Empty },
                                ["ResponsePayload"] = new AttributeValue { S = mapping.RestSource.ResponsePayload ?? string.Empty }
                            }
                        }
                        : new AttributeValue { NULL = true },
                    ["RestDestination"] = mapping.RestDestination != null 
                        ? new AttributeValue { M = new Dictionary<string, AttributeValue>
                            {
                                ["Endpoint"] = new AttributeValue { S = mapping.RestDestination.Endpoint ?? string.Empty },
                                ["Headers"] = new AttributeValue { S = mapping.RestDestination.Headers ?? string.Empty },
                                ["RequestPayload"] = new AttributeValue { S = mapping.RestDestination.RequestPayload ?? string.Empty },
                                ["ResponsePayload"] = new AttributeValue { S = mapping.RestDestination.ResponsePayload ?? string.Empty }
                            }
                        }
                        : new AttributeValue { NULL = true }
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

                _logger.LogInformation("Successfully seeded {Count} mappings into DynamoDB", mappings.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error seeding mappings data");
                throw;
            }
        }

        private async Task ClearTableDataAsync()
        {
            try
            {
                _logger.LogInformation("Clearing existing table data...");
                
                // Scan for all items
                var scanRequest = new ScanRequest
                {
                    TableName = "Mappings"
                };

                var scanResponse = await _dynamoDbClient.ScanAsync(scanRequest);
                
                if (scanResponse.Items.Count > 0)
                {
                    // Delete all items in batches
                    var deleteRequests = scanResponse.Items.Select(item => new WriteRequest
                    {
                        DeleteRequest = new DeleteRequest
                        {
                            Key = new Dictionary<string, AttributeValue>
                            {
                                ["Id"] = item["Id"]
                            }
                        }
                    }).ToList();

                    // Batch delete (DynamoDB batch write limit is 25 items)
                    const int batchSize = 25;
                    for (int i = 0; i < deleteRequests.Count; i += batchSize)
                    {
                        var batch = deleteRequests.Skip(i).Take(batchSize).ToList();
                        var batchRequest = new BatchWriteItemRequest
                        {
                            RequestItems = new Dictionary<string, List<WriteRequest>>
                            {
                                ["Mappings"] = batch
                            }
                        };

                        await _dynamoDbClient.BatchWriteItemAsync(batchRequest);
                    }

                    _logger.LogInformation("Cleared {Count} items from table", scanResponse.Items.Count);
                }
                else
                {
                    _logger.LogInformation("Table was already empty");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error clearing table data");
                throw;
            }
        }
    }
}
