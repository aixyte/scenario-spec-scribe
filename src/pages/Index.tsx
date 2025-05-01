
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import MakeDashboardForm from "@/components/MakeDashboardForm";
import ScenarioSelector from "@/components/ScenarioSelector";
import ConversionResult from "@/components/ConversionResult";
import Layout from "@/components/Layout";
import PageStepper from "@/components/PageStepper";
import { fetchScenarios, fetchScenarioInterface, MakeCredentials, Scenario } from "@/utils/makeApiUtils";
import { generateOpenApiSpec } from "@/utils/openApiGenerator";

const Index = () => {
  const [step, setStep] = useState(1);
  const [credentials, setCredentials] = useState<MakeCredentials>({ 
    baseUrl: "", 
    apiKey: "",
    teamId: "",
    organizationId: ""
  });
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [openApiSpec, setOpenApiSpec] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialsSubmit = async (baseUrl: string, apiKey: string, teamId: string, organizationId: string) => {
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

  const handleScenarioSelect = async (scenario: Scenario) => {
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
      const spec = generateOpenApiSpec(scenario, interfaceData.interface, credentials);
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

  const resetForm = () => {
    setStep(1);
    setScenarios([]);
    setSelectedScenario(null);
    setOpenApiSpec(null);
  };

  return (
    <Layout 
      title="Make Scenario to OpenAPI Converter" 
      subtitle="Convert Make.com scenarios into OpenAPI v3 specifications"
    >
      <div className="mb-8">
        <PageStepper currentStep={step} totalSteps={3} />
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
    </Layout>
  );
};

export default Index;
