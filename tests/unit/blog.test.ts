import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('blog UI contract', () => {
  it('centralizes the static publication scaffold and honest non-goals', () => {
    const { blog } = siteContent;
    expect(blog.categories).toHaveLength(6);
    expect(blog.posts).toHaveLength(9);
    expect(blog.sidebar.items).toHaveLength(3);
    expect(blog.categoriesNote).toContain('filtrado');
    expect(blog.sidebar.note).toContain('no están activas');
  });

  it('renders the static /blog route through the shared accessible shell', () => {
    const page = source('src/pages/blog.astro');
    expect(page).toContain('<BaseLayout');
    expect(page).toContain('<Navbar slot="header" />');
    expect(page).toContain('<BlogPage />');
    expect(page).toContain('<Footer slot="footer" />');
    expect(page).toContain('title={`Contenido | ${siteContent.brandName}`}');
  });

  it('uses CSS-native masonry and bordered placeholders instead of post images', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain('data-blog-masonry');
    expect(blog).toContain('column-count: 1');
    expect(blog).toContain('column-count: 2');
    expect(blog).toContain('column-count: 3');
    expect(blog).toContain('break-inside: avoid');
    expect(blog).toContain('data-placeholder');
    expect(blog).toContain('role="img"');
    expect(blog).not.toMatch(/<Image|<img\b/);
    expect(blog).not.toContain('client:');
  });

  it('keeps category and vacancy scaffolding visibly static', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain('data-static-categories');
    expect(blog).toContain('data-static-category');
    expect(blog).toContain('xl:sticky');
    expect(blog).not.toMatch(/<button\b|<a\b/);
  });
});
