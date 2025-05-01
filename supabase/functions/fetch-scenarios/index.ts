
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { baseUrl, apiKey, teamId, organizationId } = await req.json();
    
    if (!baseUrl || !apiKey) {
      throw new Error("Missing required parameters");
    }
    
    const url = new URL(baseUrl);
    
    // Prepare query parameters
    const queryParams = new URLSearchParams();
    if (teamId) {
      queryParams.append("teamId", teamId);
    }
    if (organizationId) {
      queryParams.append("organizationId", organizationId);
    }
    
    console.log("Fetching from URL:", `${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`);
    
    const response = await fetch(`${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to fetch scenarios: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    // Return mock data in case of error for development
    return new Response(
      JSON.stringify({ 
        scenarios: [
          {
            id: 12345,
            name: "Example Scenario (Mock)",
            description: "This is mock data because the API request failed",
            scheduling: { type: "on-demand" }
          }
        ]
      }),
      { 
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
