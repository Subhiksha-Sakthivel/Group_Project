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
                m.Id, m.Operation, m.Version, m.Status, 
                LastModified = DateTime.TryParse(m.LastModified, out DateTime lastMod) ? lastMod : DateTime.UtcNow,
                RestEndpoint = m.Rest?.Endpoint, 
                SoapEndpoint = m.Soap?.Endpoint
            });
        }

        public async Task<IEnumerable<MappingTableDto>> GetTableAsync()
        {
            var items = await _repo.GetTableAsync();
            return items.Select(m => new MappingTableDto
            {
                Id = m.Id ?? string.Empty,
                Operation = m.Operation ?? string.Empty,
                Version = m.Version,
                Status = m.Status ?? string.Empty,
                LastModifiedString = m.LastModified ?? string.Empty,
                DeletedAtString = m.DeletedAt,
                IsDeleted = m.IsDeleted
            });
        }

        public async Task<object?> GetByIdAsync(string id)
        {
            var m = await _repo.GetByIdAsync(id);
            if (m == null) return null;
            // Return a MappingDto-shaped object so the client can edit and PUT the same shape
            return new MappingDto
            {
                Id = m.Id ?? string.Empty,
                Operation = m.Operation ?? string.Empty,
                Version = m.Version,
                Status = m.Status ?? string.Empty,
                LastModifiedString = m.LastModified ?? string.Empty,
                IsDeleted = m.IsDeleted,
                DeletedAtString = m.DeletedAt,
                Soap = m.Soap == null ? null : new RestConfigDto
                {
                    Endpoint = m.Soap.Endpoint,
                    Headers = m.Soap.Headers,
                    RequestPayload = m.Soap.RequestPayload,
                    ResponsePayload = m.Soap.ResponsePayload
                },
                Rest = m.Rest == null ? null : new RestConfigDto
                {
                    Endpoint = m.Rest.Endpoint,
                    Headers = m.Rest.Headers,
                    RequestPayload = m.Rest.RequestPayload,
                    ResponsePayload = m.Rest.ResponsePayload
                },
                RestSource = m.RestSource == null ? null : new RestConfigDto
                {
                    Endpoint = m.RestSource.Endpoint,
                    Headers = m.RestSource.Headers,
                    RequestPayload = m.RestSource.RequestPayload,
                    ResponsePayload = m.RestSource.ResponsePayload
                },
                RestDestination = m.RestDestination == null ? null : new RestConfigDto
                {
                    Endpoint = m.RestDestination.Endpoint,
                    Headers = m.RestDestination.Headers,
                    RequestPayload = m.RestDestination.RequestPayload,
                    ResponsePayload = m.RestDestination.ResponsePayload
                }
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
                LastModified = dto.LastModified != default(DateTime) ? dto.LastModified.ToString("yyyy-MM-ddTHH:mm:ssZ") : DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Soap = dto.Soap != null ? new RestConfig
                {
                    Endpoint = dto.Soap.Endpoint,
                    Headers = dto.Soap.Headers,
                    RequestPayload = dto.Soap.RequestPayload,
                    ResponsePayload = dto.Soap.ResponsePayload
                } : null,
                Rest = dto.Rest != null ? new RestConfig
                {
                    Endpoint = dto.Rest.Endpoint,
                    Headers = dto.Rest.Headers,
                    RequestPayload = dto.Rest.RequestPayload,
                    ResponsePayload = dto.Rest.ResponsePayload
                } : null,
                RestSource = dto.RestSource != null ? new RestConfig
                {
                    Endpoint = dto.RestSource.Endpoint,
                    Headers = dto.RestSource.Headers,
                    RequestPayload = dto.RestSource.RequestPayload,
                    ResponsePayload = dto.RestSource.ResponsePayload
                } : null,
                RestDestination = dto.RestDestination != null ? new RestConfig
                {
                    Endpoint = dto.RestDestination.Endpoint,
                    Headers = dto.RestDestination.Headers,
                    RequestPayload = dto.RestDestination.RequestPayload,
                    ResponsePayload = dto.RestDestination.ResponsePayload
                } : null
            };

            var result = await _repo.CreateAsync(mapping);
            return new { result.Id };
        }

        public async Task<object?> UpdateAsync(string id, MappingDto dto)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return null;

            var updatedMapping = new Mapping
            {
                Id = id,
                Operation = dto.Operation ?? existing.Operation,
                Version = dto.Version,
                Status = dto.Status ?? existing.Status,
                LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Soap = dto.Soap != null ? new RestConfig
                {
                    Endpoint = dto.Soap.Endpoint,
                    Headers = dto.Soap.Headers,
                    RequestPayload = dto.Soap.RequestPayload,
                    ResponsePayload = dto.Soap.ResponsePayload
                } : existing.Soap,
                Rest = dto.Rest != null ? new RestConfig
                {
                    Endpoint = dto.Rest.Endpoint,
                    Headers = dto.Rest.Headers,
                    RequestPayload = dto.Rest.RequestPayload,
                    ResponsePayload = dto.Rest.ResponsePayload
                } : existing.Rest,
                RestSource = dto.RestSource != null ? new RestConfig
                {
                    Endpoint = dto.RestSource.Endpoint,
                    Headers = dto.RestSource.Headers,
                    RequestPayload = dto.RestSource.RequestPayload,
                    ResponsePayload = dto.RestSource.ResponsePayload
                } : existing.RestSource,
                RestDestination = dto.RestDestination != null ? new RestConfig
                {
                    Endpoint = dto.RestDestination.Endpoint,
                    Headers = dto.RestDestination.Headers,
                    RequestPayload = dto.RestDestination.RequestPayload,
                    ResponsePayload = dto.RestDestination.ResponsePayload
                } : existing.RestDestination
            };

            var result = await _repo.UpdateAsync(id, updatedMapping);

            return new { result.Id };
        }

        public async Task DeleteAsync(string id)
        {
            await _repo.DeleteAsync(id);
        }

        public async Task<object> SoftDeleteAsync(string id)
        {
            var result = await _repo.SoftDeleteAsync(id);
            return new { result.Id, result.Status, result.IsDeleted, DeletedAt = result.DeletedAt };
        }

        public async Task<object> RestoreAsync(string id)
        {
            var result = await _repo.RestoreAsync(id);
            return new { result.Id, result.Status, result.IsDeleted, DeletedAt = result.DeletedAt };
        }

        public async Task CleanupExpiredDeletedMappingsAsync()
        {
            await _repo.CleanupExpiredDeletedMappingsAsync();
        }
    }
}
