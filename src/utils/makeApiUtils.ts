
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

export const fetchScenarioInterface = async (
  baseUrl: string, 
  apiKey: string, 
  scenarioId: number
): Promise<{ interface: ScenarioInterface }> => {
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
