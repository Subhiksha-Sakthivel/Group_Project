// mappingsService.ts
import { sampleMappings } from "../mockData/sampleMappings";

/**
 * Simulate fetching mappings from the API
 */
export async function getMappings() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(sampleMappings);
    }, 300); // Simulate network delay
  });
}

/**
 * Simulate deleting a mapping from DynamoDB (or API)
 * @param operation - The unique identifier of the mapping to delete
 */
export async function deleteMapping(operation: string) {
  return new Promise<void>((resolve, reject) => {
    setTimeout(() => {
      // This is just a simulation — in a real API call,
      // you would hit an endpoint like DELETE /mappings/:operation
      const index = sampleMappings.findIndex((m) => m.operation === operation);
      if (index !== -1) {
        sampleMappings.splice(index, 1); // remove from mock data
        console.log(`Mapping with operation "${operation}" deleted.`);
        resolve();
      } else {
        reject(new Error("Mapping not found"));
      }
    }, 300);
  });
}


// export async function deleteMapping(operation: string) {
//   const response = await fetch(`/api/mappings/${operation}`, { method: "DELETE" });
//   if (!response.ok) {
//     throw new Error(`Failed to delete mapping: ${response.statusText}`);
//   }
// }