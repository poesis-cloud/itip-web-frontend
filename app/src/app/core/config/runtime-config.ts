import { environment } from '../../../environments/environment';

export interface RuntimeConfig {
  envName: string;
  apiBaseUrl: string;
}

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<RuntimeConfig>;
  }
}

function normalizeApiBaseUrl(value: string): string {
  if (!value) {
    return '';
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function getRuntimeConfig(): RuntimeConfig {
  const fromWindow = window.__APP_CONFIG__ ?? {};

  return {
    envName: fromWindow.envName ?? environment.envName,
    apiBaseUrl: normalizeApiBaseUrl(fromWindow.apiBaseUrl ?? environment.apiBaseUrl),
  };
}
