import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('navigation contract', () => {
  it('centralizes the complete link set without dead actions', () => {
    expect(siteConfig.navigation.map(({ key }) => key)).toEqual([
      'inicio',
      'nosotros',
      'servicios',
      'vacantes',
      'empresas',
      'recursos',
      'contacto',
    ]);
    siteConfig.navigation.forEach(({ key }) =>
      expect(siteContent.navigation.links[key]).toBeTruthy(),
    );
    expect(
      siteConfig.navigation.find(({ key }) => key === 'vacantes')?.href,
    ).toBe('/vacantes');
    expect(siteConfig.urls.login).toBe('/login');
  });

  it('matches the reference desktop shell while hydrating only mobile disclosure', () => {
    const navbar = source('src/components/Navbar.astro');
    expect(navbar).toContain('aria-label={navigation.label}');
    expect(navbar).toContain('<MobileNav');
    expect(navbar).toContain('client:load');
    expect(navbar).toContain('max-w-7xl');
    expect(navbar).toContain('h-[72px]');
    expect(navbar).toContain('h-11 w-11');
    expect(navbar).toContain('text-xl font-black tracking-tight text-white');
    expect(navbar).toContain('key === activeKey');
    expect(navbar).toContain('role="img"');
    expect(navbar).toContain('mexicoFlag');
    expect(navbar).toContain('usaFlag');
    expect(navbar).toContain('siteConfig.urls.login');
    expect(source('src/islands/MobileNav.tsx')).toContain('<details');
    expect(source('src/islands/MobileNav.tsx')).toContain(
      'aria-label={open ? labels.close : labels.open}',
    );
    expect(source('src/islands/MobileNav.tsx')).toContain(
      'data-icon="lucide:menu"',
    );
    expect(source('src/islands/MobileNav.tsx')).toContain(
      'data-icon="lucide:x"',
    );
    expect(source('src/islands/MobileNav.tsx')).toContain('loginHref');
    expect(source('src/islands/MobileNav.tsx')).toContain('flags.mexico');
    expect(source('src/islands/MobileNav.tsx')).toContain('labels.login');
    expect(source('src/islands/MobileNav.tsx')).not.toContain('>Menú<');
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
