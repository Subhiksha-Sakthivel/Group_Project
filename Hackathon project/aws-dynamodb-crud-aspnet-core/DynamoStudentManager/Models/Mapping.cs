using Amazon.DynamoDBv2.DataModel;
using System;

namespace YourNamespace.Models
{
    public class RestConfig
    {
        [DynamoDBProperty]
        public string? Endpoint { get; set; }

        [DynamoDBProperty]
        public string? Headers { get; set; }

        [DynamoDBProperty]
        public string? RequestPayload { get; set; }

        [DynamoDBProperty]
        public string? ResponsePayload { get; set; }
    }

    [DynamoDBTable("Mappings")]
    public class Mapping
    {
        [DynamoDBHashKey] 
        public string Id { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string Operation { get; set; } = string.Empty;

        [DynamoDBProperty]
        public int Version { get; set; }

        [DynamoDBProperty]
        public string Status { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string? LastModified { get; set; }

        [DynamoDBProperty]
        public string? DeletedAt { get; set; }

        [DynamoDBProperty]
        public bool IsDeleted { get; set; }

        // Screen A
        [DynamoDBProperty]
        public RestConfig? Soap { get; set; }

        [DynamoDBProperty]
        public RestConfig? Rest { get; set; }

        // Screen B
        [DynamoDBProperty]
        public RestConfig? RestSource { get; set; }

        [DynamoDBProperty]
        public RestConfig? RestDestination { get; set; }
    }
}
