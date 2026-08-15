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
    expect(footer).toContain('aria-disabled="true"');
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
    expect(source('src/pages/cookies.astro')).toContain('localStorage');
  });

  it('discloses implemented account facts without legacy contradictions', () => {
    const privacy = source('src/pages/privacidad.astro');
    const cookies = source('src/pages/cookies.astro');
    const legal = `${privacy}\n${cookies}`;
    const normalizedPrivacy = privacy.replace(/\s+/g, ' ');
    const normalizedCookies = cookies.replace(/\s+/g, ' ');
    const normalizedLegal = legal.replace(/\s+/g, ' ');

    expect(normalizedPrivacy).toContain('correo electrónico y contraseña');
    expect(normalizedPrivacy).toContain('Supabase procesa esos datos');
    expect(normalizedPrivacy).toContain('nombre público');
    expect(normalizedPrivacy).toContain('rol (Lector,');
    expect(normalizedPrivacy).toContain('estado de suspensión');
    expect(normalizedPrivacy).toContain('crear o editar publicaciones');
    expect(normalizedPrivacy).toContain('no guarda contraseñas en texto plano');
    expect(normalizedPrivacy).toContain('teamjobsmexico@gmail.com');
    expect(normalizedPrivacy).toContain('Río Churubusco 601');
    expect(normalizedPrivacy).toContain('derechos que resulten aplicables');

    expect(normalizedCookies).toContain('cliente de Supabase');
    expect(normalizedCookies).toContain('localStorage');
    expect(normalizedCookies).toContain(
      'no se gestionan mediante una cookie propia de autenticación',
    );
    expect(normalizedCookies).toContain('cerrar sesión');

    expect(normalizedLegal).not.toMatch(
      /no es un portal de registro|no mantiene sesiones/i,
    );
    expect(normalizedLegal).not.toMatch(
      /no establece cookies|no crea cookies/i,
    );
    expect(normalizedLegal).not.toMatch(
      /contraseñas?\s+(en|sin)\s+texto\s+plano.*se almacenan/i,
    );
  });

  it('removes managed Playwright infrastructure while preserving Docker targets', () => {
    const compose = source('docker-compose.yml');
    expect(compose).not.toMatch(/playwright|e2e/i);
    for (const service of ['dev:', 'build:', 'preview:', 'test:'])
      expect(compose).toContain(service);
    expect(source('package.json')).not.toMatch(
      /playwright.*(?:service|image|e2e|compose)/i,
    );
    expect(compose).toContain(
      '$${PUBLIC_SUPABASE_URL:?Define PUBLIC_SUPABASE_URL',
    );
    expect(compose).toContain(
      '$${PUBLIC_SUPABASE_PUBLISHABLE_KEY:?Define PUBLIC_SUPABASE_PUBLISHABLE_KEY',
    );
    expect(compose).not.toMatch(/service[_-]?role|sb_secret_/i);
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
