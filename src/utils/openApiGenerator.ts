
import { MakeCredentials, ScenarioInterface } from "./makeApiUtils";

export const generateOpenApiSpec = (
  scenario: any, 
  interfaceData: ScenarioInterface,
  credentials: MakeCredentials
) => {
  const apiUrl = new URL(credentials.baseUrl);
  const scenarioId = scenario.id;
  
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
                      type: 'object',
                      properties: interfaceData.input.reduce((acc, field) => {
                        acc[field.name] = { 
                          type: field.type === 'text' ? 'string' : field.type,
                          description: field.help || `${field.label || field.name} parameter`
                        };
                        if (field.required) {
                          acc[field.name].required = true;
                        }
                        return acc;
                      }, {})
                    },
                    responsive: { 
                      type: 'boolean',
                      description: 'Whether to wait for the scenario execution to complete'
                    }
                  },
                  required: ['data']
                },
                example: {
                  data: interfaceData.input.reduce((acc, field) => {
                    acc[field.name] = field.default || getDefaultValueForType(field.type);
                    return acc;
                  }, {}),
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
                      executionId: { type: 'string' },
                      outputs: {
                        type: 'object',
                        properties: interfaceData.output.reduce((acc, field) => {
                          acc[field.name] = { 
                            type: field.type === 'text' ? 'string' : field.type,
                            description: field.help || `${field.label || field.name} output` 
                          };
                          return acc;
                        }, {})
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
      schemas: {},
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

const getDefaultValueForType = (type: string) => {
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
      return [];
    default:
      return null;
  }
};
