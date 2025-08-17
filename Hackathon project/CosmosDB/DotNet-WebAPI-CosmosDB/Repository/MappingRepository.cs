using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public class MappingRepository : IMappingRepository
    {
        private readonly List<Mapping> _mappings = new();

        public Task<IEnumerable<Mapping>> GetAllAsync()
        {
            return Task.FromResult<IEnumerable<Mapping>>(_mappings);
        }

        public Task<Mapping?> GetByIdAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            return Task.FromResult(mapping);
        }

        public Task<Mapping> CreateAsync(Mapping mapping)
        {
            mapping.Id ??= Guid.NewGuid().ToString();
            mapping.LastModified = DateTime.UtcNow;
            _mappings.Add(mapping);
            return Task.FromResult(mapping);
        }

        public Task<Mapping?> UpdateAsync(string id, Mapping mapping)
        {
            var existing = _mappings.FirstOrDefault(m => m.Id == id);
            if (existing == null) return Task.FromResult<Mapping?>(null);

            mapping.Id = id;
            mapping.LastModified = DateTime.UtcNow;

            // Replace old one with updated
            _mappings.Remove(existing);
            _mappings.Add(mapping);

            return Task.FromResult<Mapping?>(mapping);
        }

        public Task DeleteAsync(string id)
        {
            var existing = _mappings.FirstOrDefault(m => m.Id == id);
            if (existing != null)
            {
                _mappings.Remove(existing);
            }
            return Task.CompletedTask;
        }
    }
}
