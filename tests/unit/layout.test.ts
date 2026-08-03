import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteContent } from '../../src/content/site';

const layout = readFileSync(
  new globalThis.URL('../../src/layouts/BaseLayout.astro', import.meta.url),
  'utf8',
);

describe('BaseLayout contract', () => {
  it('defines the Spanish semantic shell and keyboard entry point', () => {
    expect(layout).toContain('<html lang="es">');
    expect(layout).toContain('class="skip-link" href="#main-content"');
    expect(layout).toContain('<main id="main-content" tabindex="-1">');
    expect(layout.indexOf('skip-link')).toBeLessThan(layout.indexOf('<header'));
  });

  it('owns canonical, social, and Organization metadata', () => {
    expect(layout).toContain('rel="canonical"');
    expect(layout).toContain('property="og:title"');
    expect(layout).toContain('name="twitter:card"');
    expect(layout).toContain("'@type': 'Organization'");
    expect(layout).toContain('type="application/ld+json"');
  });

  it('keeps default SEO copy in central content', () => {
    expect(siteContent.seo.title).toContain(siteContent.brandName);
    expect(siteContent.seo.description.length).toBeGreaterThan(50);
  });
});
