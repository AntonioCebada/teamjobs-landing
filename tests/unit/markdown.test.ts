// @vitest-environment jsdom

import { describe, expect, it } from 'vitest';
import { renderSafeMarkdown } from '../../src/lib/blog/markdown';

describe('safe Markdown rendering', () => {
  it('keeps expected Markdown markup and safe links', () => {
    const html = renderSafeMarkdown(
      '# Safe title\n\n**Bold** and [TeamJobs](https://example.com).',
    );

    expect(html).toContain('<h1>Safe title</h1>');
    expect(html).toContain('<strong>Bold</strong>');
    expect(html).toContain('<a href="https://example.com">TeamJobs</a>');
  });

  it('removes scripts, event handlers, and unsafe URL protocols', () => {
    const html = renderSafeMarkdown(
      [
        `<script>alert('xss')</script>`,
        `<a href="javascript:alert('xss')" onclick="alert('xss')">unsafe link</a>`,
        `[unsafe](data:text/html,<script>alert('xss')</script>)`,
        `<img src="x" onerror="alert('xss')">`,
      ].join('\n'),
    );

    expect(html).not.toMatch(/<script|on\w+\s*=|javascript:|data:/i);
    expect(html).toContain('unsafe link');
  });
});
