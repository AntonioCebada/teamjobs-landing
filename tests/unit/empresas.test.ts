import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Empresas contracts', () => {
  it('centralizes the exact four-step process and five company categories', () => {
    expect(siteContent.companies.steps.map(({ title }) => title)).toEqual([
      'Contáctanos',
      'Búsqueda Activa',
      'Presentación',
      'Contratación',
    ]);
    expect(siteContent.companies.cta).toBe('Quiero contratar talento');
    expect(siteContent.companies.companyCategories).toEqual([
      'Logística',
      'Retail',
      'Corporativo',
      'Tecnología',
      'Finanzas',
    ]);
  });

  it('integrates the semantic section after Solutions and removes its placeholder', () => {
    const index = source('src/pages/index.astro');
    const empresas = source('src/components/Empresas.astro');
    expect(index.indexOf('<Solutions />')).toBeLessThan(
      index.indexOf('<Empresas />'),
    );
    expect(index).toContain("'#empresas'");
    expect(empresas).toContain('<section id="empresas"');
    expect(empresas.match(/<h2/g)).toHaveLength(1);
    expect(empresas).toContain('<ol class=');
    expect(empresas).toContain('href={siteConfig.contactHref}');
    expect(siteConfig.contactHref).toBe('#contacto');
    for (const icon of [
      'messages-square',
      'search',
      'user-check',
      'handshake',
      'truck',
      'store',
      'building-2',
      'microchip',
      'coins',
    ])
      expect(empresas).toContain(`'${icon}'`);
    expect(empresas).not.toMatch(/Icono|Logotipo pendiente/);
  });

  it('keeps the CSS carousel named, pausable, motion-safe, and overflow-safe', () => {
    const empresas = source('src/components/Empresas.astro');
    expect(empresas).toContain('role="region"');
    expect(empresas).toContain('aria-label={companies.carouselLabel}');
    expect(empresas).toContain('tabindex="0"');
    expect(empresas).toContain('aria-hidden="true"');
    expect(empresas).toContain('.company-carousel:hover .company-track');
    expect(empresas).toContain('.company-carousel:focus-within .company-track');
    expect(empresas).toContain('@media (prefers-reduced-motion: reduce)');
    expect(empresas).toContain('animation: none');
    expect(empresas).toContain('flex-wrap: wrap');
    expect(empresas).toContain('min-w-0');
    expect(empresas).not.toContain('client:');
  });
});
