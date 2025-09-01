using System;

namespace YourNamespace.Dtos
{
    public class RestConfigDto
    {
        public string? Endpoint { get; set; }
        public string? Headers { get; set; }
        public string? RequestPayload { get; set; }
        public string? ResponsePayload { get; set; }
    }

    public class MappingDto
    {
        public string? Id { get; set; }
        public string Operation { get; set; } = string.Empty;
        public int Version { get; set; }
        public string? Status { get; set; }
        public DateTime? LastModified { get; set; }

        public DateTime? DeletedAt { get; set; }

        public bool IsDeleted { get; set; }

        // Screen A
        public RestConfigDto? Soap { get; set; }
        public RestConfigDto? Rest { get; set; }

        // Screen B
        public RestConfigDto? RestSource { get; set; }
        public RestConfigDto? RestDestination { get; set; }
    }
}
