
import { MakeCredentials, ScenarioInterface } from "./makeApiUtils";

export const generateOpenApiSpec = (
  scenario: any, 
  interfaceData: ScenarioInterface,
  credentials: MakeCredentials
) => {
  const apiUrl = new URL(credentials.baseUrl);
  const scenarioId = scenario.id;
  
  // Create schemas for dynamic collections
  const schemas: Record<string, any> = {};

  // Process input schemas
  interfaceData.input.forEach(input => {
    const schemaName = `${input.name}Schema`;
    
    // Set appropriate schema based on type
    if (input.type === 'dynamicCollection') {
      schemas[schemaName] = {
        type: 'object',
        description: input.help || `${input.label || input.name} parameter`,
        properties: {}
      };
    } else if (input.type === 'collection') {
      schemas[schemaName] = {
        type: 'array',
        description: input.help || `${input.label || input.name} parameter`,
        items: {
          type: 'object',
          properties: {}
        }
      };
    } else {
      schemas[schemaName] = {
        type: convertToJsonSchemaType(input.type),
        description: input.help || `${input.label || input.name} parameter`
      };
    }
  });

  // Process output schemas
  interfaceData.output.forEach(output => {
    const schemaName = `${output.name}Schema`;
    
    // Set appropriate schema based on type
    if (output.type === 'dynamicCollection') {
      schemas[schemaName] = {
        type: 'object',
        description: output.help || `${output.label || output.name} output`,
        properties: {}
      };
    } else if (output.type === 'collection') {
      schemas[schemaName] = {
        type: 'array',
        description: output.help || `${output.label || output.name} output`,
        items: {
          type: 'object',
          properties: {}
        }
      };
    } else {
      schemas[schemaName] = {
        type: convertToJsonSchemaType(output.type),
        description: output.help || `${output.label || output.name} output`
      };
    }
  });

  // Create request and response schemas
  const requestDataProperties: Record<string, any> = {};
  interfaceData.input.forEach(input => {
    requestDataProperties[input.name] = {
      $ref: `#/components/schemas/${input.name}Schema`
    };
  });

  const responseOutputProperties: Record<string, any> = {};
  interfaceData.output.forEach(output => {
    responseOutputProperties[output.name] = {
      $ref: `#/components/schemas/${output.name}Schema`
    };
  });

  // Add common request/response schemas
  schemas['RequestData'] = {
    type: 'object',
    properties: requestDataProperties
  };

  schemas['ResponseOutputs'] = {
    type: 'object',
    properties: responseOutputProperties
  };
  
  // Generate examples based on schema types
  const exampleData: Record<string, any> = {};
  interfaceData.input.forEach(field => {
    if (field.type === 'dynamicCollection') {
      // For dynamic collections, generate an object example
      exampleData[field.name] = field.default || {
        // Use empty object as default example for dynamic collections
        // Users will need to populate this with the actual expected fields
      };
    } else {
      exampleData[field.name] = field.default || getDefaultValueForType(field.type);
    }
  });
  
  // Always use OpenAPI 3.1.0 and ensure scenarioId is used directly in the path
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
    paths: {
      [`/scenarios/${scenarioId}/run`]: {
        post: {
          operationId: `runScenario${scenarioId}`,
          summary: `Run scenario ${scenario.name}`,
          description: `Execute the "${scenario.name}" scenario with ID ${scenarioId}`,
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    data: {
                      $ref: '#/components/schemas/RequestData'
                    },
                    responsive: { 
                      type: 'boolean',
                      description: 'Whether to wait for the scenario execution to complete'
                    }
                  },
                  required: ['data']
                },
                example: {
                  data: exampleData,
                  responsive: true
                }
              }
            },
            required: true
          },
          responses: {
            '200': {
              description: 'Successful execution',
              content: { 
                'application/json': { 
                  schema: { 
                    type: 'object',
                    properties: {
                      executionId: { 
                        type: 'string' 
                      },
                      outputs: {
                        $ref: '#/components/schemas/ResponseOutputs'
                      }
                    } 
                  } 
                }
              }
            },
            '400': {
              description: 'Bad request',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
                    }
                  }
                }
              }
            },
            '401': {
              description: 'Unauthorized',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      error: { type: 'string' }
                    }
                  }
                }
              }
            }
          },
          security: [
            {
              api_key: []
            }
          ]
        }
      }
    },
    components: {
      schemas: schemas,
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

// Helper function to convert Make API types to JSON Schema types
const convertToJsonSchemaType = (makeType: string): string => {
  switch (makeType) {
    case 'text':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    case 'array':
    case 'collection':
      return 'array';
    case 'dynamicCollection':
      return 'object'; // Changed from 'array' to 'object'
    default:
      return 'string'; // Default to string for unknown types
  }
};

const getDefaultValueForType = (type: string): any => {
  switch (type) {
    case 'text':
      return 'example';
    case 'number':
      return 0;
    case 'boolean':
      return false;
    case 'object':
      return {};
    case 'array':
    case 'collection':
      return [];
    case 'dynamicCollection':
      return {}; // Changed from [] to {}
    default:
      return null;
  }
};
