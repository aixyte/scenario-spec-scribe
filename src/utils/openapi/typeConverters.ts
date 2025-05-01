
/**
 * Converts Make API types to JSON Schema types
 */
export const convertToJsonSchemaType = (makeType: string): string => {
  switch (makeType) {
    case 'text':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'object':
      return 'object';
    case 'array':
    case 'collection':
      return 'array';
    case 'dynamicCollection':
      return 'object'; // Dynamic collections are represented as objects
    default:
      return 'string'; // Default to string for unknown types
  }
};

/**
 * Returns default value examples for different Make types
 */
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
    case 'collection':
      return [];
    case 'dynamicCollection':
      return {}; // Dynamic collections default to empty objects
    default:
      return null;
  }
};
