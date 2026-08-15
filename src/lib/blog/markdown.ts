import createDOMPurify from 'dompurify';
import { marked } from 'marked';

const MARKDOWN_ALLOWED_TAGS = [
  'a',
  'blockquote',
  'br',
  'code',
  'del',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'ul',
];

const SAFE_URI_PATTERN = /^(?:(?:https?|mailto):|[/#]|\.{1,2}\/|[^:]+$)/i;

let purifier: ReturnType<typeof createDOMPurify> | undefined;

function getPurifier() {
  if (typeof window === 'undefined') {
    throw new Error('Markdown sanitization requires a browser DOM.');
  }

  purifier ??= createDOMPurify(window);
  return purifier;
}

export function renderSafeMarkdown(markdown: string): string {
  const parsed = marked.parse(markdown, {
    async: false,
    breaks: false,
    gfm: true,
  });

  if (typeof parsed !== 'string') {
    throw new Error('Markdown parser returned an unsupported result.');
  }

  return getPurifier().sanitize(parsed, {
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_TAGS: MARKDOWN_ALLOWED_TAGS,
    ALLOWED_URI_REGEXP: SAFE_URI_PATTERN,
  });
}
