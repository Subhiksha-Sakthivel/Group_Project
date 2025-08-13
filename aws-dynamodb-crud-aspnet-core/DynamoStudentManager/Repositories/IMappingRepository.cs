using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public interface IMappingRepository
    {
        Task<IEnumerable<Mapping>> GetAllAsync();
        Task<Mapping?> GetByIdAsync(string id);
        Task CreateAsync(Mapping mapping);
        Task UpdateAsync(Mapping mapping);
        Task DeleteAsync(string id);
    }
}
