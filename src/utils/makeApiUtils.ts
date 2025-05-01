import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  try {
    console.log("Fetching scenarios via Supabase Edge Function");
    
    const { data, error } = await supabase.functions.invoke("fetch-scenarios", {
      body: {
        baseUrl,
        apiKey,
        teamId,
        organizationId
      }
    });
    
    if (error) {
      console.error("Supabase Function Error:", error);
      toast.error("Failed to fetch scenarios. Please check your credentials.");
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Fetch scenarios error:", error);
    toast.error("Failed to fetch scenarios. Please check your credentials.");
    throw error;
  }
};

export const fetchScenarioInterface = async (
  baseUrl: string, 
  apiKey: string, 
  scenarioId: number
): Promise<{ interface: ScenarioInterface }> => {
  try {
    console.log("Fetching scenario interface via Supabase Edge Function");
    
    const { data, error } = await supabase.functions.invoke("fetch-scenario-interface", {
      body: {
        baseUrl,
        apiKey,
        scenarioId
      }
    });
    
    if (error) {
      console.error("Supabase Function Error:", error);
      toast.error("Failed to fetch scenario interface. Please try again.");
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error("Fetch scenario interface error:", error);
    toast.error("Failed to fetch scenario interface. Please try again.");
    throw error;
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
