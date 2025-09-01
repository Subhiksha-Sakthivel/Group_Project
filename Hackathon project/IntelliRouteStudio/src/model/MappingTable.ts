export interface MappingTable
{
        id:string,
        operation: string,
        version: number,
        status: string,
        lastModified : Date,
        isDeleted?: boolean,
        deletedAt?: Date
}