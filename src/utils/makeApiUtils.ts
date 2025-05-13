
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
    
    // Show a loading toast for potentially longer operation
    const loadingToast = toast.loading("Fetching all scenarios. This might take a moment...");
    
    const { data, error, status } = await supabase.functions.invoke("fetch-scenarios", {
      body: {
        baseUrl,
        apiKey,
        teamId,
        organizationId,
        limit: 100 // Fetch up to 100 scenarios per request for faster pagination
      }
    });
    
    // Dismiss the loading toast
    toast.dismiss(loadingToast);
    
    if (error) {
      console.error("Supabase Function Error:", error);
      console.error("Status code:", status);
      toast.error(`Failed to fetch scenarios: ${error.message || "Unknown error"}`);
      throw error;
    }
    
    // If we have scenarios data, show success with count
    if (data && data.scenarios) {
      toast.success(`Successfully fetched ${data.scenarios.length} scenarios`);
      return data;
    }
    
    // If no error but also no data
    console.warn("No scenarios data returned");
    toast.warning("No scenarios found. Please check your credentials and organization ID.");
    return { scenarios: [] };
    
  } catch (error: any) {
    console.error("Fetch scenarios error:", error);
    toast.error(`Network error: ${error.message || "Could not connect to server"}`);
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
    
    const loadingToast = toast.loading("Fetching scenario interface...");
    
    const { data, error, status } = await supabase.functions.invoke("fetch-scenario-interface", {
      body: {
        baseUrl,
        apiKey,
        scenarioId
      }
    });
    
    toast.dismiss(loadingToast);
    
    if (error) {
      console.error("Supabase Function Error:", error);
      console.error("Status code:", status);
      toast.error(`Failed to fetch scenario interface: ${error.message || "Unknown error"}`);
      throw error;
    }
    
    if (!data || !data.interface) {
      console.warn("No interface data returned");
      toast.warning("This scenario doesn't have an interface defined.");
      return { interface: { input: [], output: [] } };
    }
    
    return data;
  } catch (error: any) {
    console.error("Fetch scenario interface error:", error);
    toast.error(`Network error: ${error.message || "Could not connect to server"}`);
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
