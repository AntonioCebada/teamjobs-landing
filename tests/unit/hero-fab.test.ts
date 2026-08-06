import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('hero and FAB contracts', () => {
  it('keeps Spanish hero copy centralized and one page heading', () => {
    const hero = source('src/components/Hero.astro');
    const index = source('src/pages/index.astro');
    expect(siteContent.hero.description).toContain('talento excepcional');
    expect(siteContent.hero.titleTail).toEqual(['Talento', 'Excepcional']);
    expect(hero.match(/<h1/g)).toHaveLength(1);
    expect(index).not.toContain('<h1');
    expect(hero).toContain('href="#servicios"');
    expect(hero).toContain('href={siteConfig.contactHref}');
    expect(siteContent.hero.primaryCta).toBe('Hablar con un especialista');
  });

  it('renders a prioritized static mascot without a Hero video island', () => {
    const hero = source('src/components/Hero.astro');
    expect(hero).toContain('width={logo.width}');
    expect(hero).toContain('height={logo.height}');
    expect(hero).toContain('priority');
    expect(hero).not.toContain('HeroVideo');
    expect(hero).not.toContain('client:');
    expect(hero).not.toContain('<video');
    expect(hero).toContain('overflow-hidden rounded-full');
    expect(hero).toContain('size-full object-cover object-[center_55%]');
    expect(hero).toMatch(
      /class="relative z-10 size-\[58%\][^"]*"[\s\S]*?<Image/,
    );
    expect(hero).toContain(
      'class="relative mx-auto grid aspect-square w-full max-w-md min-w-0 place-items-center"',
    );
    expect(hero).toContain('name="target"');
    expect(hero).toContain('name="star"');
    expect(hero).not.toMatch(/[🎯⭐]/u);
    expect(hero).toContain('linear-gradient(145deg');
    expect(hero).toContain('viewBox="0 0 1440 80"');
  });

  it('keeps responsive artwork and reduced-motion contracts', () => {
    const hero = source('src/components/Hero.astro');
    expect(hero).toContain('min-w-0');
    expect(hero).toContain('lg:grid-cols-2');
    expect(source('src/styles/global.css')).toContain(
      '@media (prefers-reduced-motion: reduce)',
    );
    expect(source('src/styles/global.css')).toContain('.motion-art');
  });

  it('builds a static, safe-area WhatsApp link that announces its new context', () => {
    const fab = source('src/components/WhatsAppFab.astro');
    expect(fab).toContain('siteConfig.whatsappNumber.replace');
    expect(fab).toContain('target="_blank"');
    expect(fab).toContain('rel="noopener noreferrer"');
    expect(fab).toContain('right-6');
    expect(fab).toContain('bottom-6');
    expect(fab).toContain('z-[998]');
    expect(fab).toContain('shadow-[0_4px_16px_rgba(37,211,102,0.5)]');
    expect(fab).toContain('hover:shadow-[0_6px_24px_rgba(37,211,102,0.6)]');
    expect(fab).toContain('<Icon name="whatsapp" class="size-7" />');
    expect(fab).not.toContain('<path');
    expect(fab).toContain('safe-area-inset-right');
    expect(fab).toContain('safe-area-inset-bottom');
    expect(siteContent.fab.ariaLabel).toContain('nueva ventana');
    expect(source('src/layouts/BaseLayout.astro')).not.toContain(
      'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
    );
  });
});
