import { useEffect, useState } from 'preact/hooks';
import {
  getPublishedPosts,
  type PublicPost,
  type PublishedPostsResult,
} from '../lib/blog';
import { renderSafeMarkdown } from '../lib/blog/markdown';

export type BlogRoute =
  { kind: 'list' } | { kind: 'detail'; slug: string } | { kind: 'not-found' };

const SAFE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseBlogPath(pathname: string): BlogRoute {
  if (pathname === '/blog' || pathname === '/blog/') {
    return { kind: 'list' };
  }

  const prefix = '/blog/';
  if (!pathname.startsWith(prefix)) return { kind: 'not-found' };

  let encodedSlug = pathname.slice(prefix.length);
  if (encodedSlug.endsWith('/')) encodedSlug = encodedSlug.slice(0, -1);
  if (!encodedSlug || encodedSlug.includes('/')) return { kind: 'not-found' };

  let slug: string;
  try {
    slug = decodeURIComponent(encodedSlug);
  } catch {
    return { kind: 'not-found' };
  }

  return SAFE_SLUG_PATTERN.test(slug)
    ? { kind: 'detail', slug }
    : { kind: 'not-found' };
}

function LoadingState() {
  return <p role="status">Cargando publicaciones…</p>;
}

function ErrorState() {
  return (
    <p role="alert">
      No se pudo cargar el contenido público. Inténtalo de nuevo más tarde.
    </p>
  );
}

function NotFoundState() {
  return (
    <section aria-labelledby="blog-not-found-title" data-blog-not-found>
      <h2 id="blog-not-found-title" class="text-2xl font-bold text-brand-navy">
        Publicación no disponible
      </h2>
      <p class="mt-2 text-brand-muted">
        La publicación que buscas no está disponible.
      </p>
      <a
        class="mt-5 inline-flex font-semibold text-brand-blue underline"
        href="/blog"
      >
        Volver al contenido
      </a>
    </section>
  );
}

function PublishedList({ posts }: { posts: PublicPost[] }) {
  if (posts.length === 0) {
    return (
      <p role="status" data-blog-empty>
        Todavía no hay publicaciones publicadas.
      </p>
    );
  }

  return (
    <ul
      class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-label="Publicaciones publicadas"
      data-blog-list
    >
      {posts.map((post) => (
        <li
          class="rounded-[1.25rem] border border-brand-ink/10 bg-white p-6 shadow-[0_0.75rem_2rem_rgba(45,50,112,0.08)]"
          data-blog-list-item
          key={post.slug}
        >
          <article>
            <p class="text-sm font-semibold text-brand-blue">
              {post.authorName}
            </p>
            <h2 class="mt-2 text-xl font-bold text-brand-navy">
              <a
                class="underline-offset-4 hover:underline"
                href={`/blog/${encodeURIComponent(post.slug)}`}
              >
                {post.title}
              </a>
            </h2>
            <time
              class="mt-4 block text-sm text-brand-muted"
              dateTime={post.publishedAt}
            >
              {post.publishedAt}
            </time>
          </article>
        </li>
      ))}
    </ul>
  );
}

function PublishedDetail({ post }: { post: PublicPost }) {
  return (
    <article data-blog-detail>
      <a class="font-semibold text-brand-blue underline" href="/blog">
        ← Volver al contenido
      </a>
      <header class="mt-6 border-b border-brand-ink/10 pb-6">
        <p class="text-sm font-semibold text-brand-blue">{post.authorName}</p>
        <h2 class="mt-2 text-3xl font-bold text-brand-navy">{post.title}</h2>
        <time
          class="mt-3 block text-sm text-brand-muted"
          dateTime={post.publishedAt}
        >
          Publicado el {post.publishedAt}
        </time>
      </header>
      <div
        class="prose prose-slate mt-8 max-w-none text-brand-ink"
        data-blog-markdown
        dangerouslySetInnerHTML={{ __html: renderSafeMarkdown(post.markdown) }}
      />
    </article>
  );
}

export default function BlogApp() {
  const [route, setRoute] = useState<BlogRoute | null>(null);
  const [result, setResult] = useState<PublishedPostsResult | null>(null);

  useEffect(() => {
    const nextRoute = parseBlogPath(window.location.pathname);
    setRoute(nextRoute);
    if (nextRoute.kind === 'not-found') return;

    let mounted = true;
    void getPublishedPosts().then((nextResult) => {
      if (mounted) setResult(nextResult);
    });

    return () => {
      mounted = false;
    };
  }, []);

  if (!route || route.kind === 'list' || route.kind === 'detail') {
    if (!route || !result) return <LoadingState />;
    if (result.status === 'error') return <ErrorState />;
    if (route.kind === 'list') return <PublishedList posts={result.posts} />;

    const post = result.posts.find(
      (candidate) => candidate.slug === route.slug,
    );
    return post ? <PublishedDetail post={post} /> : <NotFoundState />;
  }

  return <NotFoundState />;
}
