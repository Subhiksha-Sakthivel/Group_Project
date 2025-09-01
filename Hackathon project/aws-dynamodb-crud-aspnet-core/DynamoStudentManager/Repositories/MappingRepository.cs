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
            // For simple listing we do a Scan - for production use optimized queries/secondary indexes
            var conditions = new List<ScanCondition>();
            var search = _context.ScanAsync<Mapping>(conditions);
            var results = await search.GetNextSetAsync();
            return results;
        }

        public async Task<IEnumerable<MappingTable>> GetTableAsync()
        {
            // For table view, we scan and project only the needed fields
            var conditions = new List<ScanCondition>();
            var search = _context.ScanAsync<Mapping>(conditions);
            var results = await search.GetNextSetAsync();
            
            return results.Select(row => new MappingTable
            {
                Id = row.Id,
                Operation = row.Operation,
                Version = row.Version,
                Status = row.Status,
                LastModified = row.LastModified
            });
        }

        public async Task<Mapping?> GetByIdAsync(string id)
        {
            return await _context.LoadAsync<Mapping>(id);
        }

        public async Task<Mapping> CreateAsync(Mapping mapping)
        {
            await _context.SaveAsync(mapping);
            return mapping;
        }

        public async Task<Mapping> UpdateAsync(string id, Mapping mapping)
        {
            mapping.Id = id;
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
                mapping.DeletedAt = DateTime.UtcNow;
                mapping.Status = "Disabled";
                mapping.LastModified = DateTime.UtcNow;
                await _context.SaveAsync(mapping);
                return mapping;
            }
            // Return a default mapping if not found
            return new Mapping { Id = id, IsDeleted = true, DeletedAt = DateTime.UtcNow };
        }

        public async Task<Mapping> RestoreAsync(string id)
        {
            var mapping = await _context.LoadAsync<Mapping>(id);
            if (mapping != null && mapping.IsDeleted)
            {
                mapping.IsDeleted = false;
                mapping.DeletedAt = null;
                mapping.Status = "Enabled";
                mapping.LastModified = DateTime.UtcNow;
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
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            
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
