import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { authErrorMessage, roleLabel } from '../../src/islands/auth-session';
const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('authentication panel contract', () => {
  it('keeps safe errors, database roles, and official browser auth APIs', () => {
    expect(
      authErrorMessage({ message: 'Invalid login credentials' }),
    ).toContain('autenticación');
    expect(
      ['reader', 'editor', 'admin'].map((role) =>
        roleLabel(role as 'reader' | 'editor' | 'admin'),
      ),
    ).toEqual(['Lector', 'Editor', 'Administrador']);
    const panel = `${source('src/islands/AuthPanel.tsx')}\n${source('src/islands/auth-session.ts')}`;
    for (const contract of [
      'auth.signUp',
      'auth.signInWithPassword',
      'auth.signOut',
      'auth.onAuthStateChange',
      'Sesión disponible',
    ])
      expect(panel).toContain(contract);
    expect(source('src/islands/AuthPanel.tsx')).not.toMatch(
      /auth\.signUp[\s\S]{0,300}role\s*:/,
    );
    expect(panel).not.toMatch(/service_role|admin_secret|email.*atrib/i);
    expect(source('src/pages/auth/index.astro')).toContain('client:load');
  });
});
