// mappingsService.ts
// import { sampleMappings } from "../mockData/sampleMappings";

import { Mapping } from "../model/Mapping";

/**
 * Simulate fetching mappings from the API
 */
// export async function getMappings() {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(sampleMappings);
//     }, 300); // Simulate network delay
//   });
// }

/**
 * Simulate deleting a mapping from DynamoDB (or API)
 * @param operation - The unique identifier of the mapping to delete
 */
// export async function deleteMapping(operation: string) {
//   return new Promise<void>((resolve, reject) => {
//     setTimeout(() => {
//       // This is just a simulation — in a real API call,
//       // you would hit an endpoint like DELETE /mappings/:operation
//       const index = sampleMappings.findIndex((m) => m.operation === operation);
//       if (index !== -1) {
//         sampleMappings.splice(index, 1); // remove from mock data
//         console.log(`Mapping with operation "${operation}" deleted.`);
//         resolve();
//       } else {
//         reject(new Error("Mapping not found"));
//       }
//     }, 300);
//   });
// }
const base_url = 'http://localhost:5214';

export async function getMappings() {
  const response = await fetch(base_url+'/api/Mappings', { method: "GET", headers: { 'Access-Control-Allow-Origin': 'true'} });
  if (!response.ok) {
    throw new Error(`Failed to get all mappings: ${response.statusText}`);
  }
  return await response.json();
}

export async function getTable() {
  const response = await fetch(base_url+'/api/Mappings/table', { method: "GET", headers: { 'Access-Control-Allow-Origin': 'true'}});
  if (!response.ok) {
    throw new Error(`Failed to get table: ${response.statusText}`);
  }
  return await response.json();
}

export async function createMapping(data: Mapping) {
  const config = {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }
  const response = await fetch(base_url+'/api/Mappings', config);
  if (!response.ok) {
    throw new Error(`Failed to delete mapping: ${response.statusText}`);
  }
}

export async function getMappingById(id: string) {
  const response = await fetch(base_url+`/api/Mappings/${id}`, { method: "GET", headers: { 'Access-Control-Allow-Origin': 'true'} });
  if (!response.ok) {
    throw new Error(`Failed to get mapping by id: ${response.statusText}`);
  }
  return await response.json();
}

export async function editMapping(id: string, mapping: Mapping) {
  const response = await fetch(base_url+`/api/Mappings/${id}`, {
  method: "PUT",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'true'
    },
    body: JSON.stringify(mapping),
  });
  if (!response.ok) {
    throw new Error(`Failed to edit mapping by id: ${response.statusText}`);
  }
}

export async function deleteMapping(id: string) {
  const response = await fetch(base_url+`/api/Mappings/${id}`, { method: "DELETE", headers: { 'Access-Control-Allow-Origin': 'true'} });
  if (!response.ok) {
    throw new Error(`Failed to delete mapping: ${response.statusText}`);
  }
}

export async function softDeleteMapping(id: string) {
  const response = await fetch(base_url+`/api/Mappings/${id}/soft-delete`, { 
    method: "POST", 
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'true'
    } 
  });
  if (!response.ok) {
    throw new Error(`Failed to soft delete mapping: ${response.statusText}`);
  }
  return await response.json();
}

export async function restoreMapping(id: string) {
  const response = await fetch(base_url+`/api/Mappings/${id}/restore`, { 
    method: "POST", 
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'true'
    } 
  });
  if (!response.ok) {
    throw new Error(`Failed to restore mapping: ${response.statusText}`);
  }
  return await response.json();
}

export async function cleanupExpiredMappings() {
  const response = await fetch(base_url+`/api/Mappings/cleanup-expired`, { 
    method: "POST", 
    headers: { 
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': 'true'
    } 
  });
  if (!response.ok) {
    throw new Error(`Failed to cleanup expired mappings: ${response.statusText}`);
  }
  return await response.json();
}