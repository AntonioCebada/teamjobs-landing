import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Icons0 provenance contracts', () => {
  it('keeps every shared UI icon identified as an Icons0 Lucide source', () => {
    const icon = source('src/components/Icon.astro');
    expect(icon).toContain('Exact Icons0 Lucide SVG geometry (ISC)');
    expect(icon).toContain('data-icon={`lucide:${name}`}');
    for (const name of [
      'messages-square',
      'user-round-search',
      'users-round',
      'handshake',
      'network',
      'arrow-right',
      'user-check',
      'building-2',
      'truck',
      'store',
      'microchip',
      'coins',
      'rocket',
      'scroll-text',
      'user',
      'clock',
      'file-text',
    ])
      expect(icon).toMatch(new RegExp(`['"]?${name}['"]?:`));
  });

  it('removes visible icon substitutes from implemented UI sources', () => {
    const ui = [
      'src/components/Hero.astro',
      'src/components/Solutions.astro',
      'src/components/Empresas.astro',
      'src/components/Resources.astro',
      'src/islands/MobileNav.tsx',
      'src/content/site.ts',
    ]
      .map(source)
      .join('\n');
    expect(ui).not.toMatch(/Icono|Logotipo pendiente|[🎯⭐]|→|>Menú</u);
  });
});
