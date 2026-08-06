const urls = {
  login: '#',
  socials: { linkedin: '#', instagram: '#' },
  legal: { privacy: '#', terms: '#' },
} as const;

export type NavigationKey =
  'inicio' | 'nosotros' | 'servicios' | 'empresas' | 'recursos' | 'contacto';

export const siteConfig = {
  siteUrl: 'https://teamjobs.example',
  contactHref: '#contacto',
  whatsappNumber: '+5215610275879',
  urls,
  navigation: [
    { key: 'inicio', href: '#inicio' },
    { key: 'nosotros', href: '#nosotros' },
    { key: 'servicios', href: '#servicios' },
    { key: 'empresas', href: '#empresas' },
    { key: 'recursos', href: '#recursos' },
    { key: 'contacto', href: '#contacto' },
  ] satisfies ReadonlyArray<{ key: NavigationKey; href: string }>,
} as const;
