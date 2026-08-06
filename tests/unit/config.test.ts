import { describe, expect, it } from 'vitest';
import { siteConfig } from '../../src/config/site';

describe('siteConfig', () => {
  it('keeps the approved WhatsApp default', () => {
    expect(siteConfig.whatsappNumber).toBe('+5215610275879');
  });

  it('provides an absolute origin for canonical and social metadata', () => {
    expect(new globalThis.URL(siteConfig.siteUrl).origin).toBe(
      siteConfig.siteUrl,
    );
  });

  it('keeps unresolved destinations out of the rendered configuration', () => {
    expect(Object.keys(siteConfig.urls.socials)).toHaveLength(0);
    expect(siteConfig.urls.legal).toEqual({
      privacy: '/privacidad',
      cookies: '/cookies',
    });
  });
});
