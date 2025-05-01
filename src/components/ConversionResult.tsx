
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ArrowLeft, Download } from "lucide-react";

interface ConversionResultProps {
  scenario: any;
  openApiSpec: any;
  onReset: () => void;
}

const ConversionResult = ({ scenario, openApiSpec, onReset }: ConversionResultProps) => {
  const [format, setFormat] = useState("json");

  const downloadSpec = () => {
    try {
      const fileName = `${scenario.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_openapi_spec.${format}`;
      const content = format === "json" 
        ? JSON.stringify(openApiSpec, null, 2) 
        : convertToYaml(openApiSpec);
      
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded as ${fileName}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download the specification');
    }
  };

  const convertToYaml = (obj: any): string => {
    // This is a very basic JSON to YAML converter for demonstration
    // In a real implementation, use a proper YAML library like js-yaml
    return JSON.stringify(obj, null, 2)
      .replace(/"/g, '')
      .replace(/,/g, '')
      .replace(/:/g, ': ')
      .replace(/\{/g, '')
      .replace(/\}/g, '')
      .replace(/\[/g, '')
      .replace(/\]/g, '');
  };

  const copyToClipboard = () => {
    const content = format === "json" 
      ? JSON.stringify(openApiSpec, null, 2) 
      : convertToYaml(openApiSpec);
    
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Copied to clipboard"))
      .catch(() => toast.error("Failed to copy to clipboard"));
  };

  return (
    <div>
      <h2 className="text-xl font-medium mb-4">OpenAPI Specification Generated</h2>
      <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-6">
        <p className="text-green-700">
          Successfully converted <strong>{scenario.name}</strong> to OpenAPI Specification v3.0
        </p>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <Tabs defaultValue="json" onValueChange={setFormat} className="w-[200px]">
          <TabsList>
            <TabsTrigger value="json">JSON</TabsTrigger>
            <TabsTrigger value="yaml">YAML</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex space-x-2">
          <Button variant="outline" onClick={copyToClipboard}>
            Copy
          </Button>
          <Button onClick={downloadSpec}>
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
        <ScrollArea className="h-[400px] p-4">
          <pre className="text-xs font-mono">
            {format === "json" 
              ? JSON.stringify(openApiSpec, null, 2) 
              : convertToYaml(openApiSpec)}
          </pre>
        </ScrollArea>
      </div>

      <div className="mt-6">
        <Button variant="outline" onClick={onReset}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Convert Another Scenario
        </Button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-100">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Next Steps</h3>
        <ul className="text-xs text-blue-700 space-y-1 list-disc pl-4">
          <li>Import this OpenAPI specification into your API management tool</li>
          <li>Use it to document your Make scenarios as REST APIs</li>
          <li>Test the API directly using the generated spec</li>
        </ul>
      </div>
    </div>
  );
};

export default ConversionResult;
