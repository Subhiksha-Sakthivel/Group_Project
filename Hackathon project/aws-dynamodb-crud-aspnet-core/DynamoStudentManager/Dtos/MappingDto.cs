using System;
using System.Text.Json.Serialization;

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
        public string Id { get; set; } = string.Empty;
        public string Operation { get; set; } = string.Empty;
        public int Version { get; set; }
        public string Status { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string LastModifiedString { get; set; } = string.Empty;
        
        public DateTime LastModified 
        { 
            get 
            {
                if (DateTime.TryParse(LastModifiedString, out DateTime result))
                    return result;
                return DateTime.UtcNow;
            }
        }
        
        [JsonIgnore]
        public string? DeletedAtString { get; set; }
        
        public DateTime? DeletedAt 
        { 
            get 
            {
                if (string.IsNullOrEmpty(DeletedAtString) || !DateTime.TryParse(DeletedAtString, out DateTime result))
                    return null;
                return result;
            }
        }
        
        public bool IsDeleted { get; set; }
        public RestConfigDto? Soap { get; set; }
        public RestConfigDto? Rest { get; set; }
        public RestConfigDto? RestSource { get; set; }
        public RestConfigDto? RestDestination { get; set; }
    }

    public class MappingTableDto
    {
        public string Id { get; set; } = string.Empty;
        public string Operation { get; set; } = string.Empty;
        public int Version { get; set; }
        public string Status { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string LastModifiedString { get; set; } = string.Empty;
        
        public DateTime LastModified 
        { 
            get 
            {
                if (DateTime.TryParse(LastModifiedString, out DateTime result))
                    return result;
                return DateTime.UtcNow;
            }
        }
        
        [JsonIgnore]
        public string? DeletedAtString { get; set; }
        
        public DateTime? DeletedAt 
        { 
            get 
            {
                if (string.IsNullOrEmpty(DeletedAtString) || !DateTime.TryParse(DeletedAtString, out DateTime result))
                    return null;
                return result;
            }
        }
        
        public bool IsDeleted { get; set; }
    }
}
