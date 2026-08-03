import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('hero and FAB contracts', () => {
  it('keeps Spanish hero copy centralized and one page heading', () => {
    const hero = source('src/components/Hero.astro');
    const index = source('src/pages/index.astro');
    expect(siteContent.hero.description).toContain('talento excepcional');
    expect(hero.match(/<h1/g)).toHaveLength(1);
    expect(index).not.toContain('<h1');
    expect(hero).toContain('href="#servicios"');
    expect(hero).toContain('siteConfig.urls.vacantes');
  });

  it('defaults to a prioritized, explicitly sized static mascot', () => {
    const hero = source('src/components/Hero.astro');
    expect(siteConfig.enableHeroVideo).toBe(false);
    expect(hero).toContain('width={logo.width}');
    expect(hero).toContain('height={logo.height}');
    expect(hero).toContain('priority');
    expect(hero).toContain('siteConfig.enableHeroVideo ?');
  });

  it('keeps optional video muted, inline, lazy, motion-safe, and visibility-aware', () => {
    const video = source('src/islands/HeroVideo.tsx');
    for (const contract of [
      'video.muted = true',
      "video.setAttribute('muted', '')",
      'playsInline',
      'preload="none"',
      "matchMedia('(prefers-reduced-motion: reduce)')",
      'new IntersectionObserver',
      'resumeWhenVisible = !video.paused',
      '{ threshold: 0.25 }',
    ])
      expect(video).toContain(contract);
    expect(video).not.toContain('autoPlay');
  });

  it('builds a static, safe-area WhatsApp link that announces its new context', () => {
    const fab = source('src/components/WhatsAppFab.astro');
    expect(fab).toContain('siteConfig.whatsappNumber.replace');
    expect(fab).toContain('target="_blank"');
    expect(fab).toContain('rel="noopener noreferrer"');
    expect(fab).toContain('safe-area-inset-right');
    expect(fab).toContain('safe-area-inset-bottom');
    expect(siteContent.fab.ariaLabel).toContain('nueva ventana');
    expect(source('src/layouts/BaseLayout.astro')).toContain(
      'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
    );
  });
});
