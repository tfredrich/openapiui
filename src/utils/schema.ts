import { OpenAPIDocument, OpenAPISchema, OperationObject } from '../types';

const REF_REGEX = /^#\/components\/schemas\/(.+)/;

export function resolveSchema(schema: OpenAPISchema | undefined, doc: OpenAPIDocument): OpenAPISchema | undefined {
  if (!schema) {
    return undefined;
  }

  if (!schema.$ref) {
    return schema;
  }

  const match = schema.$ref.match(REF_REGEX);
  if (!match) {
    return schema;
  }

  const target = doc.components?.schemas?.[match[1]];
  return target ?? schema;
}

export function getResponseSchema(operation?: OperationObject, doc?: OpenAPIDocument): OpenAPISchema | undefined {
  if (!operation || !operation.responses) {
    return undefined;
  }

  const successResponse = operation.responses['200'] || operation.responses['201'];
  const schema = successResponse?.content?.['application/json']?.schema;
  return doc ? resolveSchema(schema, doc) : schema;
}

export function getRequestSchema(operation?: OperationObject, doc?: OpenAPIDocument): OpenAPISchema | undefined {
  if (!operation?.requestBody) {
    return undefined;
  }
  const schema = operation.requestBody.content?.['application/json']?.schema;
  return doc ? resolveSchema(schema, doc) : schema;
}

export function schemaRequiredFields(schema?: OpenAPISchema): Set<string> {
  return new Set(schema?.required ?? []);
}

export function flattenSchema(schema?: OpenAPISchema): Array<{
  key: string;
  schema: OpenAPISchema;
}> {
  if (!schema?.properties) {
    return [];
  }

  return Object.entries(schema.properties).map(([key, value]) => ({
    key,
    schema: value,
  }));
}
