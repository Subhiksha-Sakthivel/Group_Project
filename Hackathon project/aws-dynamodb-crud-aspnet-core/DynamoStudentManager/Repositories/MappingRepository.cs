using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;
using System;
using System.Linq;

namespace YourNamespace.Repositories
{
    public class MappingRepository : IMappingRepository
    {
        private readonly IAmazonDynamoDB _client;
        private readonly DynamoDBContext _context;

        public MappingRepository(IAmazonDynamoDB client)
        {
            _client = client;
            _context = new DynamoDBContext(client);
        }

        public async Task<IEnumerable<Mapping>> GetAllAsync()
        {
            try
            {
                // For simple listing we do a Scan - for production use optimized queries/secondary indexes
                var conditions = new List<ScanCondition>();
                var search = _context.ScanAsync<Mapping>(conditions);
                var results = await search.GetNextSetAsync();
                
                // Ensure all required fields have default values if they're null
                foreach (var result in results)
                {
                    result.Id ??= string.Empty;
                    result.Operation ??= string.Empty;
                    result.Status ??= string.Empty;
                    result.LastModified ??= DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                }
                
                return results;
            }
            catch (Exception ex)
            {
                // Log the error and return empty result
                Console.WriteLine($"Error in GetAllAsync: {ex.Message}");
                return new List<Mapping>();
            }
        }

        public async Task<IEnumerable<MappingTable>> GetTableAsync()
        {
            try
            {
                // For table view, we scan and project only the needed fields
                var conditions = new List<ScanCondition>();
                var search = _context.ScanAsync<Mapping>(conditions);
                var results = await search.GetNextSetAsync();
                
                return results.Select(row => new MappingTable
                {
                    Id = row.Id ?? string.Empty,
                    Operation = row.Operation ?? string.Empty,
                    Version = row.Version,
                    Status = row.Status ?? string.Empty,
                    LastModified = row.LastModified ?? string.Empty,
                    DeletedAt = row.DeletedAt,
                    IsDeleted = row.IsDeleted
                });
            }
            catch (Exception ex)
            {
                // Log the error and return empty result
                Console.WriteLine($"Error in GetTableAsync: {ex.Message}");
                return new List<MappingTable>();
            }
        }

        public async Task<Mapping?> GetByIdAsync(string id)
        {
            try
            {
                var result = await _context.LoadAsync<Mapping>(id);
                if (result != null)
                {
                    // Ensure all required fields have default values if they're null
                    result.Id ??= string.Empty;
                    result.Operation ??= string.Empty;
                    result.Status ??= string.Empty;
                    result.LastModified ??= DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                }
                return result;
            }
            catch (Exception ex)
            {
                // Log the error and return null
                Console.WriteLine($"Error in GetByIdAsync: {ex.Message}");
                return null;
            }
        }

        public async Task<Mapping> CreateAsync(Mapping mapping)
        {
            // Ensure required fields have values
            mapping.Id ??= string.Empty;
            mapping.Operation ??= string.Empty;
            mapping.Status ??= string.Empty;
            
            // Set LastModified to current time if not provided
            if (string.IsNullOrEmpty(mapping.LastModified))
            {
                mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }
            await _context.SaveAsync(mapping);
            return mapping;
        }

        public async Task<Mapping> UpdateAsync(string id, Mapping mapping)
        {
            mapping.Id = id;
            // Ensure required fields have values
            mapping.Operation ??= string.Empty;
            mapping.Status ??= string.Empty;
            
            // Update LastModified to current time
            mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            await _context.SaveAsync(mapping);
            return mapping;
        }

        public async Task DeleteAsync(string id)
        {
            await _context.DeleteAsync<Mapping>(id);
        }

        public async Task<Mapping> SoftDeleteAsync(string id)
        {
            var mapping = await _context.LoadAsync<Mapping>(id);
            if (mapping != null)
            {
                mapping.IsDeleted = true;
                mapping.DeletedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                mapping.Status = "Disabled";
                mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                await _context.SaveAsync(mapping);
                return mapping;
            }
            // Return a default mapping if not found
            return new Mapping { Id = id, IsDeleted = true, DeletedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") };
        }

        public async Task<Mapping> RestoreAsync(string id)
        {
            var mapping = await _context.LoadAsync<Mapping>(id);
            if (mapping != null && mapping.IsDeleted)
            {
                mapping.IsDeleted = false;
                mapping.DeletedAt = null;
                mapping.Status = "Enabled";
                mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                await _context.SaveAsync(mapping);
                return mapping;
            }
            // Return a default mapping if not found
            return new Mapping { Id = id, IsDeleted = false };
        }

        public async Task CleanupExpiredDeletedMappingsAsync()
        {
            // For DynamoDB, we'll need to scan for expired deleted mappings
            // In production, consider using a TTL attribute or scheduled Lambda function
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ssZ");
            
            // Scan for deleted mappings older than 30 days
            var conditions = new List<ScanCondition>
            {
                new ScanCondition("IsDeleted", ScanOperator.Equal, true),
                new ScanCondition("DeletedAt", ScanOperator.LessThan, thirtyDaysAgo)
            };
            
            var search = _context.ScanAsync<Mapping>(conditions);
            var expiredMappings = await search.GetNextSetAsync();
            
            foreach (var mapping in expiredMappings)
            {
                await _context.DeleteAsync<Mapping>(mapping.Id);
            }
        }
    }
}
