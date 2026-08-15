// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import {
  createBrowserSupabaseClient,
  SupabaseClientConfigurationError,
  type PublicSupabaseEnv,
} from '../../src/lib/supabase/client';

const validEnv: PublicSupabaseEnv = {
  PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_test-key',
};

describe('browser Supabase client configuration', () => {
  it.each([
    [{ ...validEnv, PUBLIC_SUPABASE_URL: undefined }, 'PUBLIC_SUPABASE_URL'],
    [
      { ...validEnv, PUBLIC_SUPABASE_PUBLISHABLE_KEY: undefined },
      'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    ],
  ])('rejects missing %s', (env, name) => {
    expect(() => createBrowserSupabaseClient(env)).toThrow(
      SupabaseClientConfigurationError,
    );
    expect(() => createBrowserSupabaseClient(env)).toThrow(name);
  });

  it.each([
    [{ ...validEnv, PUBLIC_SUPABASE_URL: 'not-a-url' }, 'absolute URL'],
    [
      { ...validEnv, PUBLIC_SUPABASE_URL: 'https://user:pass@example.com' },
      'embedded credentials',
    ],
    [
      { ...validEnv, PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'service_role' },
      'publishable key',
    ],
  ])('rejects invalid public configuration', (env, message) => {
    expect(() => createBrowserSupabaseClient(env)).toThrow(
      SupabaseClientConfigurationError,
    );
    expect(() => createBrowserSupabaseClient(env)).toThrow(message);
  });

  it('creates a browser client with the publishable key and local storage session path', () => {
    const client = createBrowserSupabaseClient(validEnv);

    expect(client.auth).toBeDefined();
    expect(window.localStorage).toBeDefined();
  });
});
