using System;
// Uncomment when Cosmos DB SDK is ready
// using Microsoft.Azure.Cosmos;
// using Newtonsoft.Json;

namespace YourNamespace.Models
{
    // Cosmos DB document for "Mappings" container
    public class Mapping
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

        // SOAP side
        // [JsonProperty("soapEndpoint")]
        public string? SoapEndpoint { get; set; }

        // [JsonProperty("soapHeaders")]
        public string? SoapHeaders { get; set; }

        // [JsonProperty("soapRequestPayload")]
        public string? SoapRequestPayload { get; set; }

        // [JsonProperty("soapResponsePayload")]
        public string? SoapResponsePayload { get; set; }

        // REST side
        // [JsonProperty("restEndpoint")]
        public string? RestEndpoint { get; set; }

        // [JsonProperty("restHeaders")]
        public string? RestHeaders { get; set; }

        // [JsonProperty("restRequestPayload")]
        public string? RestRequestPayload { get; set; }

        // [JsonProperty("restResponsePayload")]
        public string? RestResponsePayload { get; set; }

        // REST SOURCE side
        // [JsonProperty("restSourceEndpoint")]
        public string? RestSourceEndpoint { get; set; }

        // [JsonProperty("restSourceHeaders")]
        public string? RestSourceHeaders { get; set; }

        // [JsonProperty("restSourceRequestPayload")]
        public string? RestSourceRequestPayload { get; set; }

        // [JsonProperty("restSourceResponsePayload")]
        public string? RestSourceResponsePayload { get; set; }

        // REST DESTINATION side
        // [JsonProperty("restDestinationEndpoint")]
        public string? RestDestinationEndpoint { get; set; }

        // [JsonProperty("restDestinationHeaders")]
        public string? RestDestinationHeaders { get; set; }

        // [JsonProperty("restDestinationRequestPayload")]
        public string? RestDestinationRequestPayload { get; set; }

        // [JsonProperty("restDestinationResponsePayload")]
        public string? RestDestinationResponsePayload { get; set; }
    }
}
