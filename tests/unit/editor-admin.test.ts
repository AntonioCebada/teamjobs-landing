import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canAccessRole, safeDataError } from '../../src/islands/auth-session';
const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('editor and admin authorization UI contract', () => {
  it('keeps UX checks subordinate to safe RLS errors and role-owned controls', () => {
    expect(canAccessRole('editor', 'editor')).toBe(true);
    expect(canAccessRole('reader', 'editor')).toBe(false);
    expect(canAccessRole('admin', 'admin')).toBe(true);
    expect(
      safeDataError({
        message: 'cannot demote or suspend the last active admin',
      }),
    ).toContain('último administrador');
    const editor = source('src/islands/EditorApp.tsx');
    const admin = source('src/islands/AdminApp.tsx');
    expect(editor).toContain("status: 'draft'");
    expect(editor).toContain("eq('author_id'");
    expect(editor).not.toMatch(/Publicar|publicar/i);
    for (const state of [
      'Cargando',
      'No tienes permisos',
      'No hay borradores',
      'role="alert"',
    ])
      expect(editor).toContain(state);
    for (const control of [
      "from('profiles')",
      "from('posts')",
      'Publicar',
      'Archivar',
      'suspended_at',
      'role="alert"',
    ])
      expect(admin).toContain(control);
  });
});
