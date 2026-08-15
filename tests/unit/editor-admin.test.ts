import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { canAccessRole, safeDataError } from '../../src/islands/auth-session';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('editor authorization UI contract', () => {
  it('keeps draft controls subordinate to ownership and RLS', () => {
    expect(canAccessRole('editor', 'editor')).toBe(true);
    expect(canAccessRole('reader', 'editor')).toBe(false);
    expect(safeDataError({ message: 'permission denied 42501' })).toContain(
      'permisos',
    );

    const editor = source('src/islands/EditorApp.tsx');
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
    expect(source('src/pages/editor/index.astro')).toContain('client:load');
  });

  it('keeps account and publication controls exclusive to administrators', () => {
    expect(canAccessRole('admin', 'admin')).toBe(true);
    expect(canAccessRole('editor', 'admin')).toBe(false);
    expect(
      safeDataError({ message: 'cannot demote the last active admin' }),
    ).toContain('último administrador');

    const admin = source('src/islands/AdminApp.tsx');
    for (const control of [
      "from('profiles')",
      "from('posts')",
      'Publicar',
      'Archivar',
      'suspended_at',
      'role="alert"',
    ])
      expect(admin).toContain(control);
    expect(source('src/pages/admin/index.astro')).toContain('client:load');
  });
});
