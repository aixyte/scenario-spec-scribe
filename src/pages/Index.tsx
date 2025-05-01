
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import MakeDashboardForm from "@/components/MakeDashboardForm";
import ScenarioSelector from "@/components/ScenarioSelector";
import ConversionResult from "@/components/ConversionResult";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState({ 
    baseUrl: "", 
    apiKey: "",
    teamId: "",
    organizationId: ""
  });
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [openApiSpec, setOpenApiSpec] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (baseUrl, apiKey, teamId, organizationId) => {
    setIsLoading(true);
    try {
      setCredentials({ baseUrl, apiKey, teamId, organizationId });
      
      // Fetch scenarios
      const response = await fetchScenarios(baseUrl, apiKey, teamId, organizationId);
      
      // Filter scenarios with interfaces
      const scenariosWithInterfaces = response.scenarios.filter(
        scenario => scenario.scheduling?.type === "on-demand"
      );
      
      setScenarios(scenariosWithInterfaces);
      toast.success("Successfully fetched scenarios");
      setStep(2);
    } catch (error) {
      console.error("Error fetching scenarios:", error);
      toast.error("Failed to fetch scenarios. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleScenarioSelect = async (scenario) => {
    setIsLoading(true);
    setSelectedScenario(scenario);
    
    try {
      // Fetch scenario interface
      const interfaceData = await fetchScenarioInterface(
        credentials.baseUrl,
        credentials.apiKey,
        scenario.id
      );
      
      // Generate OpenAPI spec
      const spec = generateOpenApiSpec(scenario, interfaceData.interface);
      setOpenApiSpec(spec);
      toast.success("Successfully generated OpenAPI spec");
      setStep(3);
    } catch (error) {
      console.error("Error generating OpenAPI spec:", error);
      toast.error("Failed to generate OpenAPI spec");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchScenarios = async (baseUrl, apiKey, teamId, organizationId) => {
    const url = new URL(baseUrl);
    const domain = url.hostname.split(".").slice(-2).join(".");
    const base = url.hostname.split(".")[0];
    
    // Prepare query parameters
    const queryParams = new URLSearchParams();
    if (teamId) {
      queryParams.append("teamId", teamId);
    }
    if (organizationId) {
      queryParams.append("organizationId", organizationId);
    }
    
    // For debugging purposes
    console.log("Fetching from URL:", `${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
    console.log("Using API key:", `Token ${apiKey}`);
    
    const response = await fetch(
      `${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`, 
      {
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
    }
    
    return await response.json();
  };

  const fetchScenarioInterface = async (baseUrl, apiKey, scenarioId) => {
    const url = new URL(baseUrl);
    
    const response = await fetch(`${url.origin}/api/v2/scenarios/${scenarioId}/interface`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scenario interface: ${response.statusText}`);
    }
    
    return await response.json();
  };

  const generateOpenApiSpec = (scenario, interfaceData) => {
    const apiUrl = new URL(credentials.baseUrl);
    
    return {
      openapi: '3.0.0',
      info: { 
        title: `Run ${scenario.name}`, 
        version: '1.0.0',
        description: scenario.description || `API for running the "${scenario.name}" scenario`
      },
      servers: [{ 
        url: `${apiUrl.origin}/api/v2`
      }],
      paths: {
        [`/scenarios/{scenarioId}/run`]: {
          post: {
            summary: `Run scenario ${scenario.name}`,
            parameters: [
              { 
                name: 'scenarioId', 
                in: 'path', 
                schema: { type: 'integer' }, 
                required: true,
                description: 'The ID of the scenario to run'
              }
            ],
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
                    responsive: false
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

  const getDefaultValueForType = (type) => {
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

  const resetForm = () => {
    setStep(1);
    setScenarios([]);
    setSelectedScenario(null);
    setOpenApiSpec(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm py-6">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-semibold text-gray-800">Make Scenario to OpenAPI Converter</h1>
          <p className="text-gray-500 mt-1">Convert Make.com scenarios into OpenAPI v3 specifications</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'}`}>
                1
              </div>
              <div className="h-1 flex-1 bg-gray-200">
                <div className={`h-full bg-primary ${step >= 2 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'}`}>
                2
              </div>
              <div className="h-1 flex-1 bg-gray-200">
                <div className={`h-full bg-primary ${step >= 3 ? 'w-full' : 'w-0'}`}></div>
              </div>
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${step >= 3 ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
            </div>
          </div>

          <Card className="p-6">
            {step === 1 && (
              <MakeDashboardForm onSubmit={handleCredentialsSubmit} isLoading={isLoading} />
            )}
            
            {step === 2 && (
              <ScenarioSelector 
                scenarios={scenarios} 
                onSelect={handleScenarioSelect} 
                isLoading={isLoading}
                onBack={() => setStep(1)}
              />
            )}
            
            {step === 3 && (
              <ConversionResult 
                scenario={selectedScenario} 
                openApiSpec={openApiSpec}
                onReset={resetForm}
              />
            )}
          </Card>
        </div>
      </main>
      
      <footer className="bg-white border-t py-6 mt-auto">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>Make Scenario to OpenAPI Converter © 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
