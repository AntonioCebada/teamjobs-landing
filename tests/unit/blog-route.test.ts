import { describe, expect, it } from 'vitest';
import { parseBlogPath } from '../../src/islands/BlogApp';

describe('public blog route parsing', () => {
  it('recognizes the list route with an optional trailing slash', () => {
    expect(parseBlogPath('/blog')).toEqual({ kind: 'list' });
    expect(parseBlogPath('/blog/')).toEqual({ kind: 'list' });
  });

  it('decodes one database-safe slug and preserves its value', () => {
    expect(parseBlogPath('/blog/errores-cv')).toEqual({
      kind: 'detail',
      slug: 'errores-cv',
    });
    expect(parseBlogPath('/blog/%65rrores-cv/')).toEqual({
      kind: 'detail',
      slug: 'errores-cv',
    });
  });

  it('uses the shared not-found route for unsafe, malformed, and extra paths', () => {
    for (const pathname of [
      '/',
      '/blog/unknown/extra',
      '/blog/foo%2Fbar',
      '/blog/%E0%A4%A',
      '/blog/UPPERCASE',
      '/blog/foo--bar',
      '/blog//',
    ]) {
      expect(parseBlogPath(pathname)).toEqual({ kind: 'not-found' });
    }
  });
});
