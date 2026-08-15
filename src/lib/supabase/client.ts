import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './database';

export type PublicSupabaseEnv = {
  PUBLIC_SUPABASE_URL?: string;
  PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export class SupabaseClientConfigurationError extends Error {
  readonly code = 'SUPABASE_CLIENT_CONFIGURATION_ERROR';

  constructor(message: string) {
    super(message);
    this.name = 'SupabaseClientConfigurationError';
  }
}

const PUBLISHABLE_KEY_PATTERN = /^sb_publishable_[A-Za-z0-9._-]+$/;

function requiredValue(value: string | undefined, name: string): string {
  const normalized = value?.trim();

  if (!normalized) {
    throw new SupabaseClientConfigurationError(
      `${name} must be provided to initialize the browser client.`,
    );
  }

  return normalized;
}

function validateSupabaseUrl(value: string): string {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new SupabaseClientConfigurationError(
      'PUBLIC_SUPABASE_URL must be a valid absolute URL.',
    );
  }

  if (
    !['http:', 'https:'].includes(url.protocol) ||
    !url.hostname ||
    url.username ||
    url.password
  ) {
    throw new SupabaseClientConfigurationError(
      'PUBLIC_SUPABASE_URL must use http or https without embedded credentials.',
    );
  }

  return url.toString();
}

export function validatePublicSupabaseEnv(env: PublicSupabaseEnv): {
  url: string;
  publishableKey: string;
} {
  const url = validateSupabaseUrl(
    requiredValue(env.PUBLIC_SUPABASE_URL, 'PUBLIC_SUPABASE_URL'),
  );
  const publishableKey = requiredValue(
    env.PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    'PUBLIC_SUPABASE_PUBLISHABLE_KEY',
  );

  if (!PUBLISHABLE_KEY_PATTERN.test(publishableKey)) {
    throw new SupabaseClientConfigurationError(
      'PUBLIC_SUPABASE_PUBLISHABLE_KEY must be a publishable key, not a service-role or secret key.',
    );
  }

  return { url, publishableKey };
}

function assertBrowserStorage(): Storage {
  if (typeof window === 'undefined') {
    throw new SupabaseClientConfigurationError(
      'The Supabase client is browser-only and cannot run in a server context.',
    );
  }

  try {
    return window.localStorage;
  } catch {
    throw new SupabaseClientConfigurationError(
      'The browser local-storage session is unavailable.',
    );
  }
}

export function createBrowserSupabaseClient(
  env: PublicSupabaseEnv,
): SupabaseClient<Database> {
  const { url, publishableKey } = validatePublicSupabaseEnv(env);
  const storage = assertBrowserStorage();

  return createClient<Database>(url, publishableKey, {
    auth: {
      storage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
}

function importMetaSupabaseEnv(): PublicSupabaseEnv {
  return {
    PUBLIC_SUPABASE_URL: import.meta.env.PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_PUBLISHABLE_KEY: import.meta.env
      .PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  };
}

let browserClient: SupabaseClient<Database> | undefined;

export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  browserClient ??= createBrowserSupabaseClient(importMetaSupabaseEnv());
  return browserClient;
}
