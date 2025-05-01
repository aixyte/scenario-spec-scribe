
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, ArrowRight, Search } from "lucide-react";

interface Scenario {
  id: number;
  name: string;
  description: string;
  scheduling: {
    type: string;
  };
}

interface ScenarioSelectorProps {
  scenarios: Scenario[];
  onSelect: (scenario: Scenario) => void;
  onBack: () => void;
  isLoading: boolean;
}

const ScenarioSelector = ({
  scenarios,
  onSelect,
  onBack,
  isLoading
}: ScenarioSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredScenarios = scenarios.filter(scenario => 
    scenario.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    scenario.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Select a Scenario</h2>
      <p className="text-gray-500 mb-6">
        {isLoading 
          ? "Fetching all available scenarios. This might take a moment..." 
          : `Found ${scenarios.length} on-demand or webhook-based scenario${scenarios.length !== 1 ? 's' : ''}. Select one to convert to OpenAPI.`
        }
      </p>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
            <p className="text-gray-500 mt-4">Loading scenarios...</p>
          </div>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-md">
          <p className="text-gray-500">No scenarios found matching your search</p>
        </div>
      ) : (
        <ScrollArea className="h-[400px] border border-gray-200 rounded-md">
          <div className="divide-y divide-gray-200">
            {filteredScenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => onSelect(scenario)}
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none focus:bg-gray-50"
                disabled={isLoading}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{scenario.name}</h3>
                    <p className="text-sm text-gray-500 truncate max-w-md mt-1">
                      {scenario.description || "No description"}
                    </p>
                  </div>
                  <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    ID: {scenario.id}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={isLoading}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <div className="text-sm text-gray-500 mt-2">
          {filteredScenarios.length} of {scenarios.length} scenarios displayed
        </div>
      </div>
    </div>
  );
};

export default ScenarioSelector;
