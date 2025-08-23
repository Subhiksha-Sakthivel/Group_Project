using System;
// Uncomment when Cosmos DB SDK is ready
// using Microsoft.Azure.Cosmos;
// using Newtonsoft.Json;

namespace YourNamespace.Models
{
    // Cosmos DB document for "Mappings" container
    public class MappingTable
    {
        // Cosmos DB requires lowercase 'id' as the primary key
        // [JsonProperty("id")]
        public string Id { get; set; }

        // [JsonProperty("operation")]
        public string Operation { get; set; }

        // [JsonProperty("version")]
        public int Version { get; set; }

        // [JsonProperty("status")]
        public string Status { get; set; } // e.g. "Enabled", "Disabled", "Ready for Review"

        // [JsonProperty("lastModified")]
        public DateTime LastModified { get; set; }
    }
}
