import type { PublishedPostRow } from '../supabase/database';
import { getSupabaseBrowserClient } from '../supabase/client';

export type PublicPost = {
  slug: string;
  title: string;
  markdown: string;
  authorName: string;
  publishedAt: string;
};

export type BlogError = {
  code: 'configuration' | 'request-failed' | 'invalid-response';
  message: string;
};

export type PublishedPostsResult =
  | { status: 'success'; posts: PublicPost[] }
  | { status: 'empty'; posts: [] }
  | { status: 'error'; error: BlogError };

export type PublishedPostResult =
  | { status: 'success'; post: PublicPost }
  | { status: 'not-found' }
  | { status: 'error'; error: BlogError };

const errorMessages = {
  configuration: 'Blog configuration is unavailable.',
  'request-failed': 'Published posts are temporarily unavailable.',
  'invalid-response': 'Published posts returned an invalid response.',
} as const;

function errorState(code: BlogError['code']): PublishedPostsResult {
  return { status: 'error', error: { code, message: errorMessages[code] } };
}

type ValidPublishedPostRow = Omit<PublishedPostRow, 'published_at'> & {
  published_at: string;
};

function isPublishedPostRow(value: unknown): value is ValidPublishedPostRow {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const row = value as Partial<PublishedPostRow>;
  return (
    typeof row.slug === 'string' &&
    typeof row.title === 'string' &&
    typeof row.markdown === 'string' &&
    typeof row.author_name === 'string' &&
    typeof row.published_at === 'string'
  );
}

function toPublicPost(row: unknown): PublicPost | null {
  return isPublishedPostRow(row)
    ? {
        slug: row.slug,
        title: row.title,
        markdown: row.markdown,
        authorName: row.author_name,
        publishedAt: row.published_at,
      }
    : null;
}

export async function getPublishedPosts(): Promise<PublishedPostsResult> {
  try {
    const { data, error } =
      await getSupabaseBrowserClient().rpc('published_posts');

    if (error) {
      return errorState('request-failed');
    }

    if (!Array.isArray(data)) {
      return errorState('invalid-response');
    }

    const posts = data.map(toPublicPost);
    if (posts.some((post) => post === null)) {
      return errorState('invalid-response');
    }

    const publicPosts = posts as PublicPost[];
    return publicPosts.length === 0
      ? { status: 'empty', posts: [] }
      : { status: 'success', posts: publicPosts };
  } catch {
    return errorState('configuration');
  }
}

export async function getPublishedPost(
  slug: string,
): Promise<PublishedPostResult> {
  if (!slug.trim()) {
    return { status: 'not-found' };
  }

  const result = await getPublishedPosts();
  if (result.status === 'error') {
    return result;
  }

  const post = result.posts.find((candidate) => candidate.slug === slug);
  return post ? { status: 'success', post } : { status: 'not-found' };
}
