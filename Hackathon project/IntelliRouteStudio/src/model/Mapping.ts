export interface Mapping
{
        id:string,
        operation: string,
        version: number,
        status: string,
        lastModified : Date,
        soapEndpoint: string,
        soapHeaders: string,
        soapRequestPayload: string,
        soapResponsePayload: string,
        restEndpoint: string,
        restHeaders: string,
        restRequestPayload: string,
        restResponsePayload: string
}
