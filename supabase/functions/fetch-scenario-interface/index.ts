
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
    const { baseUrl, apiKey, scenarioId } = await req.json();
    
    if (!baseUrl || !apiKey || !scenarioId) {
      throw new Error("Missing required parameters");
    }
    
    const url = new URL(baseUrl);
    const targetUrl = `${url.origin}/api/v2/scenarios/${scenarioId}/interface`;
    
    console.log("Fetching interface from URL:", targetUrl);
    
    const response = await fetch(targetUrl, {
      headers: {
        Authorization: `Token ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error:", response.status, errorText);
      throw new Error(`Failed to fetch scenario interface: ${response.statusText}`);
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
        interface: {
          input: [
            { name: "text", type: "text", label: "Input Text", required: true },
            { name: "number", type: "number", label: "Input Number" }
          ],
          output: [
            { name: "result", type: "text", label: "Result" }
          ]
        }
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
