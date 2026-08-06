import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('final footer, legal, and Compose contracts', () => {
  it('places the complete static page in the approved order', () => {
    const index = source('src/pages/index.astro');
    const order = [
      '<Hero />',
      '<About />',
      '<Solutions />',
      '<Empresas />',
      '<Resources />',
      '<Contact />',
      '<Footer slot="footer" />',
    ];

    expect(order).toEqual(
      [...order].sort((a, b) => index.indexOf(a) - index.indexOf(b)),
    );
    expect(index).not.toMatch(/Vacantes|vacantes/);
    const footer = source('src/components/Footer.astro');
    expect(footer).not.toMatch(/Vacantes|vacantes/);
    expect(footer).not.toContain('href="#"');
    expect(footer).toContain('max-w-7xl');
    expect(footer).toContain('mb-12');
    expect(footer).toContain('lg:grid-cols-4');
    expect(footer).toContain('siteConfig.urls.legal.privacy');
    expect(footer).toContain('siteConfig.urls.legal.cookies');
    expect(footer).toContain('role="img"');
    expect(siteContent.contact.details.email).toBe('teamjobsmexico@gmail.com');
    expect(siteContent.footer.serviceList).toHaveLength(6);
    expect(siteContent.contact.details.address).toContain('Río Churubusco 601');
  });

  it('uses only local legal links and a verified external contact action', () => {
    const footer = source('src/components/Footer.astro');
    expect(siteConfig.urls.legal).toEqual({
      privacy: '/privacidad',
      cookies: '/cookies',
    });
    expect(footer).toContain('siteConfig.urls.legal.privacy');
    expect(footer).toContain('siteConfig.urls.legal.cookies');
    expect(footer).toContain('https://wa.me/');
    expect(footer).toContain('target="_blank"');
    expect(footer).toContain('aria-label={footer.navigationLabel}');
    expect(footer).toContain('break-all');
    expect(footer).toContain('footer.socialLabel');
    expect(footer).toContain('footer.staffLabel');
  });

  it('provides Spanish SEO and a home link on both static legal routes', () => {
    for (const route of ['privacidad', 'cookies']) {
      const page = source(`src/pages/${route}.astro`);
      expect(page).toContain('<BaseLayout');
      expect(page).toContain('<LegalPage');
      expect(page).toContain('<Navbar slot="header" />');
      expect(page).toContain('<Footer slot="footer" />');
    }
    const legal = source('src/components/LegalPage.astro');
    expect(legal).toMatch(/<h1\s+id="legal-title"/);
    expect(legal).toContain('href="/"');
    expect(source('src/pages/privacidad.astro')).toContain(
      'formulario de contacto de esta landing',
    );
    expect(source('src/pages/cookies.astro')).toContain('no establece cookies');
  });

  it('removes managed Playwright infrastructure while preserving Docker targets', () => {
    const compose = source('docker-compose.yml');
    expect(compose).not.toMatch(/playwright|e2e|profiles/i);
    for (const service of ['dev:', 'build:', 'preview:', 'test:'])
      expect(compose).toContain(service);
    expect(source('package.json')).not.toMatch(/playwright/i);
  });

  it('keeps the footer and legal documents safe at the 320px contract width', () => {
    const footer = source('src/components/Footer.astro');
    const legal = source('src/components/LegalPage.astro');
    expect(source('src/styles/global.css')).toContain('min-width: 320px');
    expect(footer).toContain('min-w-0');
    expect(legal).toContain('page-shell min-w-0');
    expect(footer).toContain('aria-labelledby="footer-title"');
    expect(legal).toContain('aria-labelledby="legal-title"');
  });
});
