using Amazon.DynamoDBv2.DataModel;
using System;

namespace YourNamespace.Models
{
    [DynamoDBTable("Mappings")]
    public class Mapping
    {
        [DynamoDBHashKey] // Partition key
        public string Id { get; set; }

        public string Operation { get; set; }
        public int Version { get; set; }
        public string Status { get; set; } // e.g. "Enabled", "Disabled", "Ready for Review"

        public DateTime LastModified { get; set; }

        // SOAP side
        public string SoapEndpoint { get; set; }
        public string SoapHeaders { get; set; }
        public string SoapRequestPayload { get; set; }
        public string SoapResponsePayload { get; set; }

        // REST side
        public string RestEndpoint { get; set; }
        public string RestHeaders { get; set; }
        public string RestRequestPayload { get; set; }
        public string RestResponsePayload { get; set; }
    }
}
