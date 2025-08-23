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

        public Task<Mapping> GetByIdAsync(string id)
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

                existing.SoapEndpoint = updated.SoapEndpoint;
                existing.SoapHeaders = updated.SoapHeaders;
                existing.SoapRequestPayload = updated.SoapRequestPayload;
                existing.SoapResponsePayload = updated.SoapResponsePayload;

                existing.RestEndpoint = updated.RestEndpoint;
                existing.RestHeaders = updated.RestHeaders;
                existing.RestRequestPayload = updated.RestRequestPayload;
                existing.RestResponsePayload = updated.RestResponsePayload;

                SaveToFile();
            }
            return Task.FromResult(existing);
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
    }
}
