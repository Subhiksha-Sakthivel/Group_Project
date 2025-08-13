using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;

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

        public async Task<Mapping?> GetByIdAsync(string id)
        {
            return await _context.LoadAsync<Mapping>(id);
        }

        public async Task CreateAsync(Mapping mapping)
        {
            await _context.SaveAsync(mapping);
        }

        public async Task UpdateAsync(Mapping mapping)
        {
            await _context.SaveAsync(mapping);
        }

        public async Task DeleteAsync(string id)
        {
            await _context.DeleteAsync<Mapping>(id);
        }
    }
}
