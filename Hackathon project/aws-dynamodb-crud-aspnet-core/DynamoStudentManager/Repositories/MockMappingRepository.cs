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
            var results = _mappings.AsEnumerable();
            
            // Ensure all required fields have default values if they're null
            foreach (var result in results)
            {
                result.Id ??= string.Empty;
                result.Operation ??= string.Empty;
                result.Status ??= string.Empty;
                result.LastModified ??= DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }
            
            return Task.FromResult(results);
        }

        public Task<IEnumerable<MappingTable>> GetTableAsync()
        {
            return Task.FromResult(_mappings.AsEnumerable().Select(row => new MappingTable{
                Id = row.Id ?? string.Empty,
                Operation = row.Operation ?? string.Empty,
                Version = row.Version,
                Status = row.Status ?? string.Empty,
                LastModified = row.LastModified ?? string.Empty,
                DeletedAt = row.DeletedAt,
                IsDeleted = row.IsDeleted
            }));
        }

        public Task<Mapping?> GetByIdAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            if (mapping != null)
            {
                // Ensure all required fields have default values if they're null
                mapping.Id ??= string.Empty;
                mapping.Operation ??= string.Empty;
                mapping.Status ??= string.Empty;
                mapping.LastModified ??= DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }
            return Task.FromResult(mapping);
        }

        public Task<Mapping> CreateAsync(Mapping mapping)
        {
            // Ensure required fields have values
            mapping.Id = (_mappings.Count + 1).ToString();
            mapping.Operation ??= string.Empty;
            mapping.Status ??= string.Empty;
            mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
            _mappings.Add(mapping);
            SaveToFile();
            return Task.FromResult(mapping);
        }

        public Task<Mapping> UpdateAsync(string id, Mapping updated)
        {
            var existing = _mappings.FirstOrDefault(m => m.Id == id);
            if (existing != null)
            {
                existing.Operation = updated.Operation ?? string.Empty;
                existing.Version = updated.Version;
                existing.Status = updated.Status ?? string.Empty;
                existing.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

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
                mapping.DeletedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                mapping.Status = "Disabled";
                mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                SaveToFile();
                return Task.FromResult(mapping);
            }
            // Return a default mapping if not found
            return Task.FromResult(new Mapping { Id = id, IsDeleted = true, DeletedAt = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ") });
        }

        public Task<Mapping> RestoreAsync(string id)
        {
            var mapping = _mappings.FirstOrDefault(m => m.Id == id);
            if (mapping != null && mapping.IsDeleted)
            {
                mapping.IsDeleted = false;
                mapping.DeletedAt = null;
                mapping.Status = "Enabled";
                mapping.LastModified = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
                SaveToFile();
                return Task.FromResult(mapping);
            }
            // Return a default mapping if not found
            return Task.FromResult(new Mapping { Id = id, IsDeleted = false });
        }

        public Task CleanupExpiredDeletedMappingsAsync()
        {
            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30).ToString("yyyy-MM-ddTHH:mm:ssZ");
            var expiredMappings = _mappings.Where(m => m.IsDeleted && !string.IsNullOrEmpty(m.DeletedAt) && m.DeletedAt.CompareTo(thirtyDaysAgo) < 0).ToList();
            
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