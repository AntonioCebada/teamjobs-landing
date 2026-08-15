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
});
