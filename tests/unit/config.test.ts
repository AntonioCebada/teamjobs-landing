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

  it('starts in honest demo mode with documented placeholders', () => {
    expect(siteConfig.formEndpoint).toBeNull();
    expect(siteConfig.enableHeroVideo).toBe(false);
    expect(siteConfig.urls.vacantes).toBe('#');
    expect(siteConfig.urls.login).toBe('#');
  });
});
