using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public class MockMappingRepository : IMappingRepository
    {
        private readonly string _filePath = Path.Combine(AppContext.BaseDirectory, "Data", "Mappings.json");
        private List<Mapping> _mappings;

        public MockMappingRepository()
        {
            _mappings = LoadFromFile();
        }

        private List<Mapping> LoadFromFile()
        {
            if (!File.Exists(_filePath))
            {
                // Ensure Data folder exists
                Directory.CreateDirectory(Path.GetDirectoryName(_filePath)!);

                // Initialize empty file if missing
                File.WriteAllText(_filePath, "[]");
            }

            string json = File.ReadAllText(_filePath);
            return JsonSerializer.Deserialize<List<Mapping>>(json) ?? new List<Mapping>();
        }

        private void SaveToFile()
        {
            string json = JsonSerializer.Serialize(_mappings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_filePath, json);
        }

        public Task<IEnumerable<Mapping>> GetAllAsync()
        {
            return Task.FromResult(_mappings.AsEnumerable());
        }

        public Task<IEnumerable<MappingTable>> GetTableAsync()
        {
            return Task.FromResult(_mappings.AsEnumerable().Select(row => new MappingTable{
                Id = row.Id,
                Operation = row.Operation,
                Version = row.Version,
                Status = row.Status,
                LastModified =  row.LastModified            
            }));
        }

        public Task<Mapping?> GetByIdAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            return Task.FromResult(mapping);
        }

        public Task<Mapping> CreateAsync(Mapping mapping)
        {
            mapping.Id = (_mappings.Count + 1).ToString();
            mapping.LastModified = DateTime.UtcNow;
            _mappings.Add(mapping);
            SaveToFile();
            return Task.FromResult(mapping);
        }

        public Task<Mapping> UpdateAsync(string id, Mapping updated)
        {
            var existing = _mappings.FirstOrDefault(m => m.Id == id);
            if (existing != null)
            {
                existing.Operation = updated.Operation;
                existing.Version = updated.Version;
                existing.Status = updated.Status;
                existing.LastModified = DateTime.UtcNow;

                // Update SOAP configuration
                if (updated.Soap != null)
                {
                    existing.Soap = new RestConfig
                    {
                        Endpoint = updated.Soap.Endpoint,
                        Headers = updated.Soap.Headers,
                        RequestPayload = updated.Soap.RequestPayload,
                        ResponsePayload = updated.Soap.ResponsePayload
                    };
                }

                // Update REST configuration
                if (updated.Rest != null)
                {
                    existing.Rest = new RestConfig
                    {
                        Endpoint = updated.Rest.Endpoint,
                        Headers = updated.Rest.Headers,
                        RequestPayload = updated.Rest.RequestPayload,
                        ResponsePayload = updated.Rest.ResponsePayload
                    };
                }

                // Update REST Source configuration
                if (updated.RestSource != null)
                {
                    existing.RestSource = new RestConfig
                    {
                        Endpoint = updated.RestSource.Endpoint,
                        Headers = updated.RestSource.Headers,
                        RequestPayload = updated.RestSource.RequestPayload,
                        ResponsePayload = updated.RestSource.ResponsePayload
                    };
                }

                // Update REST Destination configuration
                if (updated.RestDestination != null)
                {
                    existing.RestDestination = new RestConfig
                    {
                        Endpoint = updated.RestDestination.Endpoint,
                        Headers = updated.RestDestination.Headers,
                        RequestPayload = updated.RestDestination.RequestPayload,
                        ResponsePayload = updated.RestDestination.ResponsePayload
                    };
                }

                SaveToFile();
                return Task.FromResult(existing);
            }
            
            // If not found, return the updated mapping as is
            return Task.FromResult(updated);
        }

        public Task DeleteAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            if (mapping != null)
            {
                _mappings.Remove(mapping);
                SaveToFile();
            }

            return Task.CompletedTask;
        }

        public Task<Mapping> SoftDeleteAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            if (mapping != null)
            {
                mapping.IsDeleted = true;
                mapping.DeletedAt = DateTime.UtcNow;
                mapping.Status = "Disabled";
                mapping.LastModified = DateTime.UtcNow;
                SaveToFile();
                return Task.FromResult(mapping);
            }
            // Return a default mapping if not found
            return Task.FromResult(new Mapping { Id = id, IsDeleted = true, DeletedAt = DateTime.UtcNow });
        }

        public Task<Mapping> RestoreAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            if (mapping != null && mapping.IsDeleted)
            {
                mapping.IsDeleted = false;
                mapping.DeletedAt = null;
                mapping.Status = "Enabled";
                mapping.LastModified = DateTime.UtcNow;
                SaveToFile();
                return Task.FromResult(mapping);
            }
            // Return a default mapping if not found
            return Task.FromResult(new Mapping { Id = id, IsDeleted = false });
        }

        public Task CleanupExpiredDeletedMappingsAsync()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
            var expiredMappings = _mappings.Where(m => m.IsDeleted && m.DeletedAt.HasValue && m.DeletedAt.Value < thirtyDaysAgo).ToList();
            
            foreach (var mapping in expiredMappings)
            {
                _mappings.Remove(mapping);
            }
            
            if (expiredMappings.Any())
            {
                SaveToFile();
            }
            
            return Task.CompletedTask;
        }
    }
}