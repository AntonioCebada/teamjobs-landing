import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Icons0 provenance contracts', () => {
  it('keeps every shared UI icon identified as an Icons0 source', () => {
    const icon = source('src/components/Icon.astro');
    expect(icon).toContain('Exact Icons0 SVG geometry');
    expect(icon).toContain('const iconSource = iconSources[name]');
    expect(icon).toContain("'paper-plane': 'lucide:send'");
    expect(icon).toContain("whatsapp: 'simple-icons:whatsapp'");
    expect(icon).toContain("'linkedin-in': 'simple-icons:linkedin'");
    expect(icon).toContain("'facebook-f': 'simple-icons:facebook'");
    expect(icon).toContain("instagram: 'simple-icons:instagram'");
    expect(icon).toContain("'x-twitter': 'simple-icons:x'");
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
      'mail',
      'phone',
      'shield-check',
      'cookie',
      'external-link',
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
