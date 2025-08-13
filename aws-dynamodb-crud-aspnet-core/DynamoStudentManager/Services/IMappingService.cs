using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Dtos;

namespace YourNamespace.Services
{
    public interface IMappingService
    {
        Task<IEnumerable<object>> GetAllAsync();
        Task<object?> GetByIdAsync(string id);
        Task<object> CreateAsync(MappingDto dto);
        Task<object?> UpdateAsync(string id, MappingDto dto);
        Task DeleteAsync(string id);
    }
}
