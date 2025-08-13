using System;

namespace YourNamespace.Dtos
{
    public class MappingDto
    {
        public string Id { get; set; } // optional for create; required for update
        public string Operation { get; set; }
        public int Version { get; set; }
        public string Status { get; set; }
        public DateTime? LastModified { get; set; }

        public string SoapEndpoint { get; set; }
        public string SoapHeaders { get; set; }
        public string SoapRequestPayload { get; set; }
        public string SoapResponsePayload { get; set; }

        public string RestEndpoint { get; set; }
        public string RestHeaders { get; set; }
        public string RestRequestPayload { get; set; }
        public string RestResponsePayload { get; set; }
    }
}
