const urls = {
  socials: {},
  legal: { privacy: '/privacidad', cookies: '/cookies' },
} as const;

export type NavigationKey = 'inicio' | 'vacantes' | 'contenido' | 'contacto';

export const siteConfig = {
  siteUrl: 'https://teamjobs.example',
  contactHref: '#contacto',
  authHref: '/auth/',
  whatsappNumber: '+5215610275879',
  urls,
  navigation: [
    { key: 'inicio', href: '/' },
    { key: 'vacantes', disabled: true },
    { key: 'contenido', href: '/blog' },
    { key: 'contacto', disabled: true },
  ] satisfies ReadonlyArray<{
    key: NavigationKey;
    href?: string;
    disabled?: boolean;
  }>,
} as const;
