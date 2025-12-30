import { parse as parseYaml } from 'yaml';
import { ConsoleConfig, OpenAPIDocument, SpecSource } from '../types';

export async function loadSpec(source: SpecSource): Promise<OpenAPIDocument> {
  if (source.type === 'inline') {
    return parseSpecText(source.payload);
  }

  const response = await fetch(source.url, {
    headers: {
      Accept: 'application/json, application/yaml, text/yaml, */*;q=0.8',
    },
  });
  if (!response.ok) {
    throw new Error(`Unable to download spec: ${response.status} ${response.statusText}`);
  }

  const text = await response.text();
  if (looksLikeHtml(text)) {
    throw new Error('Spec URL returned HTML content. Provide a direct JSON or YAML OpenAPI document URL.');
  }
  return parseSpecText(text);
}

export async function loadConfigFromFile(file: File): Promise<ConsoleConfig> {
  const text = await file.text();
  return JSON.parse(text);
}

export function parseSpecText(text: string): OpenAPIDocument {
  try {
    return JSON.parse(text);
  } catch {
    return parseYaml(text) as OpenAPIDocument;
  }
}

function looksLikeHtml(text: string) {
  const trimmed = text.trimStart().slice(0, 32).toLowerCase();
  return trimmed.startsWith('<!doctype') || trimmed.startsWith('<html');
}
