using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using YourNamespace.Models;

namespace YourNamespace.Repositories
{
    public class MockMappingRepository : IMappingRepository
    {
        // Mock in-memory list to simulate DynamoDB data
        private readonly List<Mapping> _mockMappings = new()
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
            return Task.CompletedTask;
        }

        public Task UpdateAsync(Mapping mapping)
        {
            var existingIndex = _mockMappings.FindIndex(m => m.Id == mapping.Id);
            if (existingIndex >= 0)
            {
                mapping.LastModified = DateTime.UtcNow;
                _mockMappings[existingIndex] = mapping;
            }
            return Task.CompletedTask;
        }

        public Task DeleteAsync(string id)
        {
            _mockMappings.RemoveAll(m => m.Id == id);
            return Task.CompletedTask;
        }
    }
}
