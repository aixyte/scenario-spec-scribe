
import { MakeCredentials, ScenarioInterface } from "./makeApiUtils";
import { generateSchemas, generateExampleData } from "./openapi/schemaGenerator";
import { generatePaths } from "./openapi/pathsGenerator";
import { OpenApiSpec } from "./openapi/types";

/**
 * Generates an OpenAPI specification from a Make scenario
 */
export const generateOpenApiSpec = (
  scenario: any, 
  interfaceData: ScenarioInterface,
  credentials: MakeCredentials
): OpenApiSpec => {
  const apiUrl = new URL(credentials.baseUrl);
  const scenarioId = scenario.id;
  
  // Generate schemas for input/output fields
  const schemas = generateSchemas(interfaceData);
  
  // Generate paths for the scenario endpoints
  const paths = generatePaths(scenarioId, scenario.name, interfaceData);
  
  // Assemble the complete OpenAPI spec
  return {
    openapi: '3.1.0',
    info: { 
      title: `Run ${scenario.name}`, 
      version: '1.0.0',
      description: scenario.description || `API for running the "${scenario.name}" scenario`
    },
    servers: [{ 
      url: `${apiUrl.origin}/api/v2`
    }],
    paths,
    components: {
      schemas,
      securitySchemes: {
        api_key: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
          description: 'API key with format: "Token YOUR_API_KEY"'
        }
      }
    }
  };
};
