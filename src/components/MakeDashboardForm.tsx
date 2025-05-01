
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight } from "lucide-react";

interface MakeDashboardFormProps {
  onSubmit: (baseUrl: string, apiKey: string) => void;
  isLoading: boolean;
}

const MakeDashboardForm = ({ onSubmit, isLoading }: MakeDashboardFormProps) => {
  const [baseUrl, setBaseUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!baseUrl) {
      setError("Please enter a valid Dashboard URL");
      return;
    }
    
    if (!apiKey) {
      setError("Please enter your API key");
      return;
    }

    // Validate and format the baseUrl
    try {
      let formattedUrl = baseUrl;
      if (!formattedUrl.startsWith("http")) {
        formattedUrl = `https://${formattedUrl}`;
      }
      
      const url = new URL(formattedUrl);
      
      // Make sure it's a valid Make domain
      if (!url.hostname.includes("make.com") && !url.hostname.includes("make.celonis.com")) {
        setError("URL must be from make.com or make.celonis.com domains");
        return;
      }
      
      onSubmit(formattedUrl, apiKey);
    } catch (e) {
      setError("Please enter a valid URL (e.g., https://eu1.make.com)");
    }
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">Connect to Make</h2>
      <p className="text-gray-500 mb-6">
        Enter your Make dashboard URL and API key with all scopes to fetch your scenarios.
      </p>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="baseUrl">Dashboard URL</Label>
          <Input
            id="baseUrl"
            placeholder="https://eu1.make.com"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Example: eu1.make.com, us1.make.com, eu2.make.celonis.com
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            placeholder="Enter your API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500">
            Make sure your API key has all required scopes
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            "Connecting..."
          ) : (
            <>
              Fetch Scenarios <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <div className="mt-6 p-4 bg-gray-50 rounded-md border border-gray-200">
        <h3 className="text-sm font-medium mb-2">How to get your API key?</h3>
        <ol className="text-xs text-gray-600 space-y-1 list-decimal pl-4">
          <li>Go to your Make.com dashboard</li>
          <li>Click on your profile icon in the top right</li>
          <li>Select "API tokens"</li>
          <li>Create a new token with all scopes and copy it</li>
        </ol>
      </div>
    </div>
  );
};

export default MakeDashboardForm;
