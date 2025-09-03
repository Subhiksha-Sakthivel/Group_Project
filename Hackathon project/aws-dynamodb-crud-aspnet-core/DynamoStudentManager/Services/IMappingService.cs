using System.Collections.Generic;
using System.Threading.Tasks;
using YourNamespace.Dtos;
using YourNamespace.Models;

namespace YourNamespace.Services
{
    public interface IMappingService
    {
        Task<IEnumerable<object>> GetAllAsync();
        Task<IEnumerable<MappingTableDto>> GetTableAsync();
        Task<object?> GetByIdAsync(string id);
        Task<object> CreateAsync(MappingDto dto);
        Task<object?> UpdateAsync(string id, MappingDto dto);
        Task DeleteAsync(string id);
        Task<object> SoftDeleteAsync(string id);
        Task<object> RestoreAsync(string id);
        Task CleanupExpiredDeletedMappingsAsync();
    }
}
