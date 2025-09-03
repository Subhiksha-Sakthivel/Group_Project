using Amazon.DynamoDBv2.DataModel;
using System;

namespace YourNamespace.Models
{
    // DynamoDB document for table view
    public class MappingTable
    {
        [DynamoDBHashKey]
        public string Id { get; set; } = string.Empty;

        [DynamoDBProperty]
        public string Operation { get; set; } = string.Empty;

        [DynamoDBProperty]
        public int Version { get; set; }

        [DynamoDBProperty]
        public string Status { get; set; } = string.Empty; // e.g. "Enabled", "Disabled", "Ready for Review"

        [DynamoDBProperty]
        public string? LastModified { get; set; }

        [DynamoDBProperty]
        public string? DeletedAt { get; set; }

        [DynamoDBProperty]
        public bool IsDeleted { get; set; }
    }
}
