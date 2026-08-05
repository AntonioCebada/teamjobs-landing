import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('Resources contracts', () => {
  it('centralizes the exact heading and ordered Spanish card content', () => {
    const { resources } = siteContent;
    expect(resources.eyebrow).toBe('Recursos');
    expect(resources.titleStart + resources.titleAccent).toBe(
      'Contenido para impulsar tu carrera',
    );
    expect(resources.description).toBe(
      'Guías prácticas, estrategias y consejos creados por expertos en RH para ayudarte a crecer profesionalmente.',
    );
    expect(resources.cards).toHaveLength(3);
    expect(
      resources.cards.map(({ category, title, readingTime, date }) => [
        category,
        title,
        readingTime,
        date,
      ]),
    ).toEqual([
      [
        'Para Candidatos',
        'Cómo hacer un CV que destaque en 2026',
        '8 min lectura',
        'Jun 2026',
      ],
      [
        'Para Empresas',
        '5 estrategias para retener talento clave',
        '10 min lectura',
        'May 2026',
      ],
      [
        'Tips Entrevistas',
        'Las 10 preguntas más frecuentes en entrevistas',
        '12 min lectura',
        'Jun 2026',
      ],
    ]);
    expect(resources.cards.map(({ gradient }) => gradient)).toEqual([
      'linear-gradient(135deg, #6B3FD4, #00CDB8)',
      'linear-gradient(135deg, #3B82F6, #e11d48)',
      'linear-gradient(135deg, #2D3270, #7c3aed)',
    ]);
  });

  it('places one semantic Resources section immediately after Empresas', () => {
    const index = source('src/pages/index.astro');
    const resources = source('src/components/Resources.astro');
    expect(index).toMatch(/<Empresas \/>\s*<Resources \/>/);
    expect(index).toContain("'#recursos'");
    expect(resources).toContain('<section id="recursos"');
    expect(resources.match(/<article\b/g)).toHaveLength(1);
    expect(resources).not.toContain('client:');
  });

  it('keeps cards informational while preserving focus, responsive, and motion contracts', () => {
    const resources = source('src/components/Resources.astro');
    expect(resources).toContain('md:grid-cols-3');
    expect(resources).toContain('min-w-0');
    expect(resources).toContain('tabindex="0"');
    expect(resources).toContain('.resource-card:focus-visible');
    expect(resources).toContain('@media (prefers-reduced-motion: reduce)');
    expect(resources).not.toMatch(/href=.*articulos/);
    expect(resources).not.toContain('Conocer más');
    expect(resources.match(/<a\b/g)).toHaveLength(1);
    expect(resources.match(/<svg\b/g)).toBeNull();
    for (const icon of ['scroll-text', 'user', 'clock', 'file-text', 'rocket'])
      expect(resources).toContain(icon);
  });

  it('renders the exact accessible consultation CTA through centralized config', () => {
    const resources = source('src/components/Resources.astro');
    expect(siteContent.resources.consultation).toEqual({
      title: '¿Listo para encontrar el talento ideal?',
      description:
        'Contáctanos hoy y recibe una consulta gratuita para diseñar la estrategia de RH perfecta para tu empresa.',
      cta: 'Consulta Gratuita',
    });
    expect(siteConfig.contactHref).toBe('#contacto');
    expect(resources).toContain('aria-labelledby="consultation-title"');
    expect(resources).toContain('alt=""');
    expect(resources).toContain('href={siteConfig.contactHref}');
    expect(resources).toContain('.consultation-banner::after');
    expect(resources).toContain('animation: none');
  });
});
