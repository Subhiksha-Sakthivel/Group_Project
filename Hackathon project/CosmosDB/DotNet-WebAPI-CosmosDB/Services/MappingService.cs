using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;
using YourNamespace.Repositories;
// Uncomment when Cosmos DB SDK is ready
// using Microsoft.Azure.Cosmos;

namespace YourNamespace.Services
{
    public class MappingService : IMappingService
    {
        private readonly IMappingRepository _mockRepository;

        // Uncomment when Cosmos DB SDK is ready
        // private readonly CosmosClient _cosmosClient;
        // private readonly Container _container;

        public MappingService(IMappingRepository mockRepository /*, CosmosClient cosmosClient */)
        {
            _mockRepository = mockRepository;

            // Uncomment when Cosmos DB SDK is ready
            /*
            _cosmosClient = cosmosClient;
            _container = _cosmosClient.GetContainer("YourDatabaseName", "Mappings");
            */
        }

        // Get all mappings
        public async Task<IEnumerable<Mapping?>> GetAllAsync()
        {
            // Uncomment when Cosmos DB SDK is ready
            /*
            var query = _container.GetItemQueryIterator<Mapping>("SELECT * FROM c");
            List<Mapping> results = new();
            while (query.HasMoreResults)
            {
                var response = await query.ReadNextAsync();
                results.AddRange(response);
            }
            return results;
            */

            // Mock JSON persistence
            return await _mockRepository.GetAllAsync();
        }
        
        // Get by Id
        public async Task<Mapping?> GetByIdAsync(string id)
        {
            // Uncomment when Cosmos DB SDK is ready
            /*
            try
            {
                ItemResponse<Mapping> response = await _container.ReadItemAsync<Mapping>(id, new PartitionKey(id));
                return response.Resource;
            }
            catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
            {
                return null;
            }
            */

            // Mock JSON persistence
            return await _mockRepository.GetByIdAsync(id); // ✅ added await
        }

        // Create
        public async Task<Mapping?> CreateAsync(Mapping mapping)
        {
            // Uncomment when Cosmos DB SDK is ready
            /*
            mapping.Id = Guid.NewGuid().ToString();
            mapping.LastModified = DateTime.UtcNow;
            ItemResponse<Mapping> response = await _container.CreateItemAsync(mapping, new PartitionKey(mapping.Id));
            return response.Resource;
            */

            // Mock JSON persistence
            await _mockRepository.CreateAsync(mapping); // ✅ added await
            return mapping;
        }

        // Update
        public async Task<Mapping?> UpdateAsync(string id, Mapping mapping)
        {
            // Uncomment when Cosmos DB SDK is ready
            /*
            mapping.Id = id;
            mapping.LastModified = DateTime.UtcNow;
            ItemResponse<Mapping> response = await _container.UpsertItemAsync(mapping, new PartitionKey(id));
            return response.Resource;
            */

            // Mock JSON persistence
            var existing = await _mockRepository.GetByIdAsync(id);
            if (existing == null) return null;
            mapping.Id = id;
            return await _mockRepository.UpdateAsync(id, mapping);
        }

        // Delete
        public async Task DeleteAsync(string id)
        {
            // Uncomment when Cosmos DB SDK is ready
            /*
            await _container.DeleteItemAsync<Mapping>(id, new PartitionKey(id));
            */

            // Mock JSON persistence
            await _mockRepository.DeleteAsync(id);
        }
    }
}
