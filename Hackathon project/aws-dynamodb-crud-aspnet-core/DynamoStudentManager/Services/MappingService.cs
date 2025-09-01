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
                m.Id, m.Operation, m.Version, m.Status, m.LastModified, 
                RestEndpoint = m.Rest?.Endpoint, 
                SoapEndpoint = m.Soap?.Endpoint
            });
        }

        public async Task<IEnumerable<MappingTable>> GetTableAsync()
        {
            return await _repo.GetTableAsync();
        }

        public async Task<object?> GetByIdAsync(string id)
        {
            var m = await _repo.GetByIdAsync(id);
            if (m == null) return null;
            return new {
                m.Id, m.Operation, m.Version, m.Status, m.LastModified,
                SoapEndpoint = m.Soap?.Endpoint, 
                SoapHeaders = m.Soap?.Headers, 
                SoapRequestPayload = m.Soap?.RequestPayload, 
                SoapResponsePayload = m.Soap?.ResponsePayload,
                RestEndpoint = m.Rest?.Endpoint, 
                RestHeaders = m.Rest?.Headers, 
                RestRequestPayload = m.Rest?.RequestPayload, 
                RestResponsePayload = m.Rest?.ResponsePayload,
                RestSourceEndpoint = m.RestSource?.Endpoint,
                RestSourceHeaders = m.RestSource?.Headers,
                RestSourceRequestPayload = m.RestSource?.RequestPayload,
                RestSourceResponsePayload = m.RestSource?.ResponsePayload,
                RestDestinationEndpoint = m.RestDestination?.Endpoint,
                RestDestinationHeaders = m.RestDestination?.Headers,
                RestDestinationRequestPayload = m.RestDestination?.RequestPayload,
                RestDestinationResponsePayload = m.RestDestination?.ResponsePayload
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
                LastModified = DateTime.UtcNow,
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
            return new { result.Id, result.Status, result.IsDeleted, result.DeletedAt };
        }

        public async Task<object> RestoreAsync(string id)
        {
            var result = await _repo.RestoreAsync(id);
            return new { result.Id, result.Status, result.IsDeleted, result.DeletedAt };
        }

        public async Task CleanupExpiredDeletedMappingsAsync()
        {
            await _repo.CleanupExpiredDeletedMappingsAsync();
        }
    }
}
