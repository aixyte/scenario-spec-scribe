
import { ScenarioInterface } from "../makeApiUtils";
import { OpenApiSchema } from "./types";
import { convertToJsonSchemaType, getDefaultValueForType } from "./typeConverters";

/**
 * Generates a schema for a given interface field
 */
export const generateFieldSchema = (field: any): OpenApiSchema => {
  if (field.type === 'dynamicCollection') {
    return {
      type: 'object',
      description: field.help || `${field.label || field.name} parameter`,
      properties: {}
    };
  } else if (field.type === 'collection') {
    return {
      type: 'array',
      description: field.help || `${field.label || field.name} parameter`,
      items: {
        type: 'object',
        properties: {}
      }
    };
  } else {
    return {
      type: convertToJsonSchemaType(field.type),
      description: field.help || `${field.label || field.name} parameter`
    };
  }
};

/**
 * Generates all schemas for a scenario interface
 */
export const generateSchemas = (interfaceData: ScenarioInterface): Record<string, OpenApiSchema> => {
  const schemas: Record<string, OpenApiSchema> = {};

  // Process input schemas
  interfaceData.input.forEach(input => {
    const schemaName = `${input.name}Schema`;
    schemas[schemaName] = generateFieldSchema(input);
  });

  // Process output schemas
  interfaceData.output.forEach(output => {
    const schemaName = `${output.name}Schema`;
    schemas[schemaName] = {
      ...generateFieldSchema(output),
      description: output.help || `${output.label || output.name} output`
    };
  });

  // Create request and response schemas
  const requestDataProperties: Record<string, any> = {};
  interfaceData.input.forEach(input => {
    requestDataProperties[input.name] = {
      $ref: `#/components/schemas/${input.name}Schema`
    };
  });

  const responseOutputProperties: Record<string, any> = {};
  interfaceData.output.forEach(output => {
    responseOutputProperties[output.name] = {
      $ref: `#/components/schemas/${output.name}Schema`
    };
  });

  // Add common request/response schemas
  schemas['RequestData'] = {
    type: 'object',
    properties: requestDataProperties
  };

  schemas['ResponseOutputs'] = {
    type: 'object',
    properties: responseOutputProperties
  };

  return schemas;
};

/**
 * Generates example data for request body based on the interface
 */
export const generateExampleData = (interfaceData: ScenarioInterface): Record<string, any> => {
  const exampleData: Record<string, any> = {};
  interfaceData.input.forEach(field => {
    if (field.type === 'dynamicCollection') {
      // For dynamic collections, generate an object example
      exampleData[field.name] = field.default || {
        // Use empty object as default example for dynamic collections
        // Users will need to populate this with the actual expected fields
      };
    } else {
      exampleData[field.name] = field.default || getDefaultValueForType(field.type);
    }
  });
  return exampleData;
};
