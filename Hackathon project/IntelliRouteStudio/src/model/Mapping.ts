export interface Mapping
{
        id:string,
        operation: string,
        version: number,
        status: string,
        lastModified : Date,
        isDeleted?: boolean,
        deletedAt?: Date,
        soapEndpoint?: string,
        soapHeaders?: string,
        soapRequestPayload?: string,
        soapResponsePayload?: string,
        restEndpoint?: string,
        restHeaders?: string,
        restRequestPayload?: string,
        restResponsePayload?: string
        restSourceEndpoint?: string,
        restSourceHeaders?: string,
        restSourceRequestPayload?: string,
        restSourceResponsePayload?: string,
        restDestinationEndpoint?: string,
        restDestinationHeaders?: string,
        restDestinationRequestPayload?: string,
        restDestinationResponsePayload?: string
}
