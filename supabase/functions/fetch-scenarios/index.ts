
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
    const { baseUrl, apiKey, teamId, organizationId, limit = 100 } = await req.json();
    
    if (!baseUrl || !apiKey) {
      throw new Error("Missing required parameters: baseUrl or apiKey");
    }
    
    const url = new URL(baseUrl);
    let allScenarios = [];
    let hasMore = true;
    let offset = 0;
    
    // Continue fetching until we have all scenarios
    while (hasMore) {
      // Prepare query parameters
      const queryParams = new URLSearchParams();
      if (teamId) {
        queryParams.append("teamId", teamId);
      }
      if (organizationId) {
        queryParams.append("organizationId", organizationId);
      }
      
      // Add pagination parameters
      queryParams.append("pg[limit]", limit.toString());
      queryParams.append("pg[offset]", offset.toString());
      queryParams.append("pg[sortBy]", "proprietal");
      queryParams.append("pg[sortDir]", "desc");
      
      const apiUrl = `${url.origin}/api/v2/scenarios${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      console.log("Fetching from URL:", apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Token ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
        throw new Error(`Failed to fetch scenarios: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Add scenarios from this page to our collection
      if (data.scenarios && data.scenarios.length > 0) {
        allScenarios = [...allScenarios, ...data.scenarios];
        offset += data.scenarios.length;
        
        // If we received fewer scenarios than the limit, we've reached the end
        hasMore = data.scenarios.length === parseInt(limit.toString());
      } else {
        hasMore = false;
      }
    }
    
    console.log(`Total scenarios fetched: ${allScenarios.length}`);
    
    return new Response(
      JSON.stringify({ scenarios: allScenarios }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    
    // Return empty array instead of mock data
    return new Response(
      JSON.stringify({ 
        scenarios: [],
        error: error.message || "Unknown error occurred"
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
