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
        private readonly string _storageFile = Path.Combine(AppContext.BaseDirectory, "mock-mappings.json");
        private List<Mapping> _mockMappings;

        public MockMappingRepository()
        {
            // Load from disk at startup
            if (File.Exists(_storageFile))
            {
                var json = File.ReadAllText(_storageFile);
                _mockMappings = JsonSerializer.Deserialize<List<Mapping>>(json) ?? new List<Mapping>();
            }
            else
            {
                // Seed initial data if file not found
                _mockMappings = new List<Mapping>
                {
                    new Mapping {
                        Id = "1",
                        Operation = "GetCustomers",
                        Version = 2,
                        Status = "Enabled",
                        LastModified = DateTime.UtcNow.AddDays(-1),
                        SoapEndpoint = "GetCustomerList",
                        SoapHeaders = "",
                        SoapRequestPayload = "",
                        SoapResponsePayload = "<GetCustomerListResponse><Customer><CustomerName>Smith</CustomerName></Customer></GetCustomerListResponse>",
                        RestEndpoint = "/customers",
                        RestHeaders = "",
                        RestRequestPayload = "{ \"lastName\": \"Smith\", \"maxResults\": 10 }",
                        RestResponsePayload = "{ \"customerID\": 123456 }"
                    },
                    new Mapping {
                        Id = "2",
                        Operation = "CreateCustomers",
                        Version = 2,
                        Status = "Enabled",
                        LastModified = DateTime.UtcNow.AddHours(-5),
                        SoapEndpoint = "CreateCustomer",
                        SoapHeaders = "",
                        SoapRequestPayload = "",
                        SoapResponsePayload = "",
                        RestEndpoint = "/customers",
                        RestHeaders = "",
                        RestRequestPayload = "{ \"firstName\": \"John\" }",
                        RestResponsePayload = "{ \"customerID\": 987654 }"
                    }
                };

                SaveToDisk();
            }
        }

        private void SaveToDisk()
        {
            var json = JsonSerializer.Serialize(_mockMappings, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(_storageFile, json);
        }

        public Task<IEnumerable<Mapping>> GetAllAsync()
        {
            return Task.FromResult(_mockMappings.AsEnumerable());
        }

        public Task<Mapping?> GetByIdAsync(string id)
        {
            var mapping = _mockMappings.FirstOrDefault(m => m.Id == id);
            return Task.FromResult(mapping);
        }

        public Task CreateAsync(Mapping mapping)
        {
            mapping.Id = string.IsNullOrWhiteSpace(mapping.Id) ? Guid.NewGuid().ToString() : mapping.Id;
            mapping.LastModified = DateTime.UtcNow;
            _mockMappings.Add(mapping);
            SaveToDisk();
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Mapping mapping)
        {
            var existingIndex = _mockMappings.FindIndex(m => m.Id == mapping.Id);
            if (existingIndex >= 0)
            {
                mapping.LastModified = DateTime.UtcNow;
                _mockMappings[existingIndex] = mapping;
                SaveToDisk();
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(string id)
        {
            _mockMappings.RemoveAll(m => m.Id == id);
            SaveToDisk();
            return Task.CompletedTask;
        }
    }
}