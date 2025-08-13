using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YourNamespace.Dtos;
using YourNamespace.Models;
using YourNamespace.Repositories;

namespace YourNamespace.Services
{
    public class MappingService : IMappingService
    {
        private readonly IMappingRepository _repo;

        public MappingService(IMappingRepository repo)
        {
            _repo = repo;
        }

        public async Task<IEnumerable<object>> GetAllAsync()
        {
            var items = await _repo.GetAllAsync();
            return items.OrderBy(m => m.Operation).Select(m => (object)new {
                m.Id, m.Operation, m.Version, m.Status, m.LastModified, m.RestEndpoint, m.SoapEndpoint
            });
        }

        public async Task<object?> GetByIdAsync(string id)
        {
            var m = await _repo.GetByIdAsync(id);
            if (m == null) return null;
            return new {
                m.Id, m.Operation, m.Version, m.Status, m.LastModified,
                m.SoapEndpoint, m.SoapHeaders, m.SoapRequestPayload, m.SoapResponsePayload,
                m.RestEndpoint, m.RestHeaders, m.RestRequestPayload, m.RestResponsePayload
            };
        }

        public async Task<object> CreateAsync(MappingDto dto)
        {
            var mapping = new Mapping
            {
                Id = string.IsNullOrWhiteSpace(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
                Operation = dto.Operation,
                Version = dto.Version,
                Status = dto.Status ?? "Disabled",
                LastModified = dto.LastModified ?? DateTime.UtcNow,
                SoapEndpoint = dto.SoapEndpoint,
                SoapHeaders = dto.SoapHeaders,
                SoapRequestPayload = dto.SoapRequestPayload,
                SoapResponsePayload = dto.SoapResponsePayload,
                RestEndpoint = dto.RestEndpoint,
                RestHeaders = dto.RestHeaders,
                RestRequestPayload = dto.RestRequestPayload,
                RestResponsePayload = dto.RestResponsePayload
            };

            await _repo.CreateAsync(mapping);
            return new { mapping.Id };
        }

        public async Task<object?> UpdateAsync(string id, MappingDto dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            // update fields
            existing.Operation = dto.Operation ?? existing.Operation;
            existing.Version = dto.Version;
            existing.Status = dto.Status ?? existing.Status;
            existing.LastModified = DateTime.UtcNow;

            existing.SoapEndpoint = dto.SoapEndpoint ?? existing.SoapEndpoint;
            existing.SoapHeaders = dto.SoapHeaders ?? existing.SoapHeaders;
            existing.SoapRequestPayload = dto.SoapRequestPayload ?? existing.SoapRequestPayload;
            existing.SoapResponsePayload = dto.SoapResponsePayload ?? existing.SoapResponsePayload;

            existing.RestEndpoint = dto.RestEndpoint ?? existing.RestEndpoint;
            existing.RestHeaders = dto.RestHeaders ?? existing.RestHeaders;
            existing.RestRequestPayload = dto.RestRequestPayload ?? existing.RestRequestPayload;
            existing.RestResponsePayload = dto.RestResponsePayload ?? existing.RestResponsePayload;

            await _repo.UpdateAsync(existing);

            return new { existing.Id };
        }

        public async Task DeleteAsync(string id)
        {
            await _repo.DeleteAsync(id);
        }
    }
}
