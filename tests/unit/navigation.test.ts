import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('navigation contract', () => {
  it('centralizes the four approved accesses and honest destinations', () => {
    expect(siteConfig.navigation.map(({ key }) => key)).toEqual([
      'inicio',
      'vacantes',
      'contenido',
      'contacto',
    ]);
    siteConfig.navigation.forEach(({ key }) =>
      expect(siteContent.navigation.links[key]).toBeTruthy(),
    );
    expect(
      siteConfig.navigation.map(({ href, disabled }) => [href, disabled]),
    ).toEqual([
      ['/', undefined],
      [undefined, true],
      ['/blog', undefined],
      [undefined, true],
    ]);
    expect(siteContent.navigation.links).toEqual({
      inicio: 'Inicio',
      vacantes: 'Vacantes',
      contenido: 'Contenido',
      contacto: 'Contacto',
    });
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
    expect(navbar).toContain("aria-current={active ? 'page' : undefined}");
    expect(navbar).toContain('data-nav-disabled');
    expect(navbar).toContain('aria-disabled="true"');
    expect(navbar).toContain('<SearchPlaceholder');
    expect(navbar).toContain('role="img"');
    expect(navbar).toContain('mexicoFlag');
    expect(navbar).toContain('usaFlag');
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
    expect(source('src/islands/MobileNav.tsx')).toContain('flags.mexico');
    expect(source('src/islands/MobileNav.tsx')).toContain('labels.disabled');
    expect(source('src/islands/MobileNav.tsx')).toContain('data-nav-disabled');
    expect(source('src/islands/MobileNav.tsx')).toContain(
      "aria-current={active ? 'page' : undefined}",
    );
    expect(source('src/islands/MobileNav.tsx')).not.toContain('>Menú<');
  });

  it('uses a non-interactive search landmark without a fake input or action', () => {
    const search = source('src/components/SearchPlaceholder.astro');
    expect(search).toContain('role="search"');
    expect(search).toContain('aria-disabled="true"');
    expect(search).toContain('data-search-placeholder');
    expect(search).toContain('search.placeholder');
    expect(search).toContain('search.status');
    expect(search).not.toContain('<input');
    expect(search).not.toContain('<form');
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
