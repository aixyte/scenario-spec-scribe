
import { MakeCredentials, ScenarioInterface } from "../makeApiUtils";

// OpenAPI schema related types
export interface OpenApiSchema {
  type: string;
  description?: string;
  properties?: Record<string, any>;
  items?: {
    type: string;
    properties?: Record<string, any>;
  };
}

export interface OpenApiSpec {
  openapi: string;
  info: {
    title: string;
    version: string;
    description?: string;
  };
  servers: Array<{
    url: string;
  }>;
  paths: Record<string, any>;
  components: {
    schemas: Record<string, OpenApiSchema>;
    securitySchemes: Record<string, any>;
  };
}

// Context for OpenAPI generation
export interface OpenApiGenerationContext {
  scenario: any;
  interfaceData: ScenarioInterface;
  credentials: MakeCredentials;
}
