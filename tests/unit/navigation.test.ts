import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('navigation contract', () => {
  it('centralizes the complete link set and honest external placeholders', () => {
    expect(siteConfig.navigation.map(({ key }) => key)).toEqual([
      'inicio',
      'nosotros',
      'servicios',
      'vacantes',
      'empresas',
      'recursos',
      'contacto',
    ]);
    expect(siteConfig.urls.vacantes).toBe('#');
    expect(siteConfig.urls.login).toBe('#');
    siteConfig.navigation.forEach(({ key }) =>
      expect(siteContent.navigation.links[key]).toBeTruthy(),
    );
  });

  it('keeps the navbar static and hydrates only the mobile disclosure', () => {
    const navbar = source('src/components/Navbar.astro');
    expect(navbar).toContain('<nav aria-label={navigation.label}');
    expect(navbar).toContain('<MobileNav');
    expect(navbar).toContain('client:load');
    expect(source('src/islands/MobileNav.tsx')).toContain('<details');
  });

  it('covers dismissal, focus containment, focus return, and scroll restoration', () => {
    const mobile = source('src/islands/MobileNav.tsx');
    for (const contract of [
      "event.key === 'Escape'",
      "event.key !== 'Tab'",
      'triggerRef.current?.focus()',
      "document.body.style.overflow = 'hidden'",
      'document.body.style.overflow = previousOverflow',
      'element.inert = true',
      'onClick={() => close(false)}',
    ])
      expect(mobile).toContain(contract);
  });
});
