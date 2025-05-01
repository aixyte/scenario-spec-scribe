
import { ScenarioInterface } from "../makeApiUtils";
import { generateExampleData } from "./schemaGenerator";

/**
 * Generates the paths object for the OpenAPI spec
 */
export const generatePaths = (scenarioId: number, scenarioName: string, interfaceData: ScenarioInterface): Record<string, any> => {
  const exampleData = generateExampleData(interfaceData);
  
  return {
    [`/scenarios/${scenarioId}/run`]: {
      post: {
        operationId: `runScenario${scenarioId}`,
        summary: `Run scenario ${scenarioName}`,
        description: `Execute the "${scenarioName}" scenario with ID ${scenarioId}`,
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
  };
};
