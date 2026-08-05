import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('about and solutions contracts', () => {
  it('centralizes the mocked content and exactly four solutions', () => {
    expect(siteContent.about.values).toHaveLength(4);
    expect(siteContent.about.pillars.map(({ title }) => title)).toEqual([
      'Misión',
      'Visión',
    ]);
    expect(siteContent.solutions.items.map(({ title }) => title)).toEqual([
      'Reclutamiento y Selección',
      'Gestión de Talento',
      'Outsourcing de RH',
      'Consultoría Organizacional',
    ]);
    expect(siteContent.solutions.action).toBe('Conocer más');
  });

  it('renders semantic section anchors and headings in page order', () => {
    const index = source('src/pages/index.astro');
    const about = source('src/components/About.astro');
    const solutions = source('src/components/Solutions.astro');
    expect(index.indexOf('<About />')).toBeLessThan(
      index.indexOf('<Solutions />'),
    );
    expect(about).toContain('<section id="nosotros"');
    expect(solutions).toContain('<section id="servicios"');
    expect(about.match(/<h2/g)).toHaveLength(1);
    expect(solutions.match(/<h2/g)).toHaveLength(1);
    expect(about).toContain('bg-brand-sky');
  });

  it('uses honest in-page actions and mobile-first no-overflow contracts', () => {
    expect(siteConfig.contactHref).toBe('#contacto');
    for (const path of [
      'src/components/About.astro',
      'src/components/Solutions.astro',
    ]) {
      const component = source(path);
      expect(component).toContain('href={siteConfig.contactHref}');
      expect(component).toContain('min-w-0');
    }
    expect(source('src/components/Solutions.astro')).toContain(
      'md:grid-cols-2',
    );
    expect(source('src/components/About.astro')).toContain('sm:grid-cols-2');
    expect(source('src/components/About.astro')).toContain(
      'name="messages-square"',
    );
    const solutions = source('src/components/Solutions.astro');
    for (const icon of [
      'user-round-search',
      'users-round',
      'handshake',
      'network',
    ])
      expect(solutions).toContain(`'${icon}'`);
    expect(source('src/components/Solutions.astro')).toContain(
      'name="arrow-right"',
    );
  });

  it('renders the About video independently with autoplay-safe attributes', () => {
    const about = source('src/components/About.astro');
    expect(about).toContain('<video');
    expect(about).toMatch(/autoplay[\s\S]*muted[\s\S]*loop[\s\S]*playsinline/);
    expect(about).toContain('poster={logo.src}');
    expect(about).toContain('onloadedmetadata=');
    expect(about).toContain("matchMedia('(prefers-reduced-motion: reduce)')");
    expect(about).toMatch(
      /removeAttribute.+autoplay.+pause.+currentTime.+0.+load/s,
    );
    expect(about).toContain('<source src="/gatito.mp4" type="video/mp4" />');
    expect(about).toContain('aria-label={about.videoLabel}');
    expect(siteContent.about.videoFallback).toContain('no puede reproducir');
  });
});
