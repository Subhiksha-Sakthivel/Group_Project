using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public interface IMappingRepository
    {
        Task<IEnumerable<Mapping>> GetAllAsync();
        Task<IEnumerable<MappingTable>> GetTableAsync();
        Task<Mapping?> GetByIdAsync(string id);
        Task<Mapping> CreateAsync(Mapping mapping);
        Task<Mapping> UpdateAsync(string id, Mapping mapping);
        Task DeleteAsync(string id);
        Task<Mapping> SoftDeleteAsync(string id);
        Task<Mapping> RestoreAsync(string id);
        Task CleanupExpiredDeletedMappingsAsync();
    }
}
