
import { toast } from "sonner";

export interface MakeCredentials {
  baseUrl: string;
  apiKey: string;
  teamId: string;
  organizationId: string;
}

export interface Scenario {
  id: number;
  name: string;
  description: string;
  scheduling: {
    type: string;
  };
}

export interface ScenarioInterface {
  input: Array<{
    name: string;
    type: string;
    label?: string;
    help?: string;
    required?: boolean;
    default?: any;
  }>;
  output: Array<{
    name: string;
    type: string;
    label?: string;
    help?: string;
  }>;
}

export const fetchScenarios = async (
  baseUrl: string, 
  apiKey: string, 
  teamId: string, 
  organizationId: string
): Promise<{ scenarios: Scenario[] }> => {
  const url = new URL(baseUrl);
  
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
  
  // Use a CORS proxy service to bypass CORS restrictions
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  const targetUrl = `${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
  
  try {
    const response = await fetch(`${corsProxy}${targetUrl}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest' // Required by some CORS proxies
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("API request failed. This is likely due to CORS restrictions.");
    
    // For development purposes, return mock data
    return { 
      scenarios: [
        {
          id: 12345,
          name: "Example Scenario (Mock)",
          description: "This is mock data because the API request failed due to CORS restrictions",
          scheduling: { type: "on-demand" }
        }
      ]
    };
  }
};

export const fetchScenarioInterface = async (
  baseUrl: string, 
  apiKey: string, 
  scenarioId: number
): Promise<{ interface: ScenarioInterface }> => {
  const url = new URL(baseUrl);
  
  // Use a CORS proxy service
  const corsProxy = "https://cors-anywhere.herokuapp.com/";
  const targetUrl = `${url.origin}/api/v2/scenarios/${scenarioId}/interface`;
  
  try {
    const response = await fetch(`${corsProxy}${targetUrl}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to fetch scenario interface: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    toast.error("API request failed. This is likely due to CORS restrictions.");
    
    // Return mock data for development
    return { 
      interface: {
        input: [
          { name: "text", type: "text", label: "Input Text", required: true },
          { name: "number", type: "number", label: "Input Number" }
        ],
        output: [
          { name: "result", type: "text", label: "Result" }
        ]
      }
    };
  }
};

export const getDefaultValueForType = (type: string): any => {
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
