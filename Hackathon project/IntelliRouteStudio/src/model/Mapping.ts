export interface RestConfig {
  endpoint: string;
  headers: string;
  requestPayload: string;
  responsePayload: string;
}

export interface Mapping {
  id: string;
  operation: string;
  version: number;
  status: string;
  lastModified: Date;
  isDeleted?: boolean;
  deletedAt?: Date | null;

  // Nested objects (can be null in JSON)
  soap?: RestConfig | null;
  rest?: RestConfig | null;
  restSource?: RestConfig | null;
  restDestination?: RestConfig | null;
}
