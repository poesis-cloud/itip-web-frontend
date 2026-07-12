import { getRuntimeConfig } from './runtime-config';

describe('runtime config', () => {
  afterEach(() => {
    delete window.__APP_CONFIG__;
  });

  it('uses window overrides and trims trailing slash', () => {
    window.__APP_CONFIG__ = {
      envName: 'preprod',
      apiBaseUrl: 'https://api-preprod.example.com/',
    };

    const config = getRuntimeConfig();

    expect(config.envName).toBe('preprod');
    expect(config.apiBaseUrl).toBe('https://api-preprod.example.com');
  });

  it('falls back to build environment config when window config is absent', () => {
    const config = getRuntimeConfig();

    expect(config.envName.length).toBeGreaterThan(0);
    expect(config.apiBaseUrl).not.toBeUndefined();
  });

  it('returns empty api base url unchanged', () => {
    window.__APP_CONFIG__ = {
      apiBaseUrl: '',
    };

    const config = getRuntimeConfig();

    expect(config.apiBaseUrl).toBe('');
  });
});
