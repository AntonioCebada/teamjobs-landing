import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { siteContent } from '../../src/content/site';

const source = (path: string) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

describe('blog UI contract', () => {
  it('centralizes the static publication scaffold and honest non-goals', () => {
    const { blog } = siteContent;
    expect(blog.title).toBe('Explora contenido de interés');
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

  it('renders the exact centralized heading without assembling the old split copy', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain('{blog.title}');
    expect(blog).not.toContain('titleStart');
    expect(blog).not.toContain('titleAccent');
    expect(siteContent.blog.title).not.toContain('Descubre contenido para');
  });

  it('keeps the wide canvas exception local to the blog page', () => {
    const blog = source('src/components/BlogPage.astro');
    const global = source('src/styles/global.css');
    expect(blog).toContain('data-blog-canvas');
    expect(blog).toContain('.blog-page-canvas');
    expect(blog).toContain('width: 100%');
    expect(blog).toContain('max-width: none');
    expect(global).toContain('width: min(100% - 2rem, 72rem)');
  });

  it('uses the full blog canvas for a fluid, responsive intro block', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain('data-blog-intro');
    expect(blog).toContain('data-blog-title');
    expect(blog).toContain('data-blog-subtitle');
    expect(blog).toMatch(
      /\.blog-intro\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;/,
    );
    expect(blog).toMatch(
      /\.blog-intro-title\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;[\s\S]*?font-size:\s*clamp\(/,
    );
    expect(blog).toMatch(
      /\.blog-intro-subtitle\s*\{[\s\S]*?width:\s*100%;[\s\S]*?max-width:\s*none;[\s\S]*?font-size:\s*clamp\(/,
    );
    expect(blog).not.toContain('max-w-3xl');
    expect(blog).not.toContain('max-w-2xl');
  });

  it('keeps the responsive intro on a restrained editorial scale', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain(
      'font-size: clamp(2.25rem, calc(2rem + 1.1vw), 4rem);',
    );
    expect(blog).toContain(
      'font-size: clamp(1rem, calc(0.9rem + 0.3vw), 1.25rem);',
    );
    expect(blog).toContain(
      'line-height: clamp(1.5rem, calc(1.4rem + 0.3vw), 2rem);',
    );
    expect(blog).toContain('margin-top: clamp(1rem, 1.25vw, 1.5rem);');
    expect(blog).toContain('margin-top: clamp(0.75rem, 0.8vw, 1.25rem);');
  });

  it('mounts the browser public blog island instead of static placeholder cards', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain("import BlogApp from '../islands/BlogApp';");
    expect(blog).toContain('<BlogApp client:load />');
    expect(blog).not.toContain('data-blog-card');
    expect(blog).not.toContain('data-placeholder');
  });

  it('keeps public state rendering and Markdown safety in the island', () => {
    const blogApp = source('src/islands/BlogApp.tsx');
    expect(blogApp).toContain('getPublishedPosts');
    expect(blogApp).toContain('renderSafeMarkdown');
    expect(blogApp).toContain('dangerouslySetInnerHTML');
    expect(blogApp).not.toMatch(/post\.(email|role)/);
    expect(blogApp).not.toContain('authorEmail');
  });

  it('keeps category and vacancy scaffolding visibly static', () => {
    const blog = source('src/components/BlogPage.astro');
    expect(blog).toContain('data-static-categories');
    expect(blog).toContain('data-static-category');
    expect(blog).toContain('xl:sticky');
    expect(blog).not.toMatch(/<button\b|<a\b/);
  });
});
