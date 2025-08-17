using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public interface IMappingRepository
    {
        Task<IEnumerable<Mapping>> GetAllAsync();
        Task<Mapping> GetByIdAsync(string id);
        Task<Mapping> CreateAsync(Mapping mapping);
        Task<Mapping> UpdateAsync(string id, Mapping updated);
        Task DeleteAsync(string id);
    }
}
