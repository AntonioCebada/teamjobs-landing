import { useEffect, useState } from 'preact/hooks';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import {
  isActiveProfile,
  roleLabel,
  safeDataError,
  useAuthSnapshot,
  type Post,
  type Profile,
  type Role,
} from './auth-session';

type AdminPost = Pick<
  Post,
  'id' | 'author_id' | 'slug' | 'title' | 'markdown' | 'status' | 'updated_at'
>;
const roles: Role[] = ['reader', 'editor', 'admin'];

export default function AdminApp() {
  const snapshot = useAuthSnapshot();
  const [users, setUsers] = useState<Profile[]>([]);
  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  const load = async () => {
    const client = getSupabaseBrowserClient();
    const [userResult, postResult] = await Promise.all([
      client
        .from('profiles')
        .select('id,display_name,role,suspended_at,created_at,updated_at')
        .order('created_at'),
      client
        .from('posts')
        .select('id,author_id,slug,title,markdown,status,updated_at')
        .order('updated_at', { ascending: false }),
    ]);
    if (userResult.error || postResult.error) {
      setMessage(safeDataError(userResult.error ?? postResult.error));
      setState('error');
      return;
    }
    setUsers((userResult.data ?? []) as Profile[]);
    setPosts((postResult.data ?? []) as AdminPost[]);
    setState('ready');
  };

  useEffect(() => {
    if (
      snapshot.status === 'authenticated' &&
      snapshot.profile.role === 'admin' &&
      isActiveProfile(snapshot.profile)
    )
      void load();
  }, [snapshot]);

  if (snapshot.status === 'loading')
    return <p role="status">Cargando administración…</p>;
  if (snapshot.status === 'error')
    return <p role="alert">{snapshot.message}</p>;
  if (
    snapshot.status === 'anonymous' ||
    snapshot.profile.role !== 'admin' ||
    !isActiveProfile(snapshot.profile)
  )
    return (
      <section>
        <h1>Administración</h1>
        <p role="alert">
          No tienes permisos para administrar cuentas y publicaciones.
        </p>
        <a href="/auth">Inicia sesión con una cuenta administradora.</a>
      </section>
    );
  if (state === 'loading') return <p role="status">Cargando administración…</p>;
  if (state === 'error') return <p role="alert">{message}</p>;

  const updateUser = async (
    id: string,
    patch: { role?: Role; suspended_at?: string | null },
  ) => {
    const client = getSupabaseBrowserClient();
    const result = await client
      .from('profiles')
      .update(patch)
      .eq('id', id)
      .select('id,display_name,role,suspended_at,created_at,updated_at')
      .single();
    if (result.error || !result.data) {
      setMessage(safeDataError(result.error));
      return;
    }
    setUsers((current) =>
      current.map((user) => (user.id === id ? (result.data as Profile) : user)),
    );
    setMessage('Cuenta actualizada.');
  };
  const transition = async (id: string, status: 'published' | 'archived') => {
    const client = getSupabaseBrowserClient();
    const result = await client
      .from('posts')
      .update({ status })
      .eq('id', id)
      .select('id,author_id,slug,title,markdown,status,updated_at')
      .single();
    if (result.error || !result.data) {
      setMessage(safeDataError(result.error));
      return;
    }
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? (result.data as AdminPost) : post,
      ),
    );
    setMessage('Publicación actualizada.');
  };
  const editPost = async (event: Event, id: string) => {
    event.preventDefault();
    const values = Object.fromEntries(
      new FormData(event.currentTarget as HTMLFormElement),
    );
    const client = getSupabaseBrowserClient();
    const result = await client
      .from('posts')
      .update({
        slug: String(values.slug),
        title: String(values.title),
        markdown: String(values.markdown),
      })
      .eq('id', id)
      .select('id,author_id,slug,title,markdown,status,updated_at')
      .single();
    if (result.error || !result.data) {
      setMessage(safeDataError(result.error));
      return;
    }
    setPosts((current) =>
      current.map((post) =>
        post.id === id ? (result.data as AdminPost) : post,
      ),
    );
    setMessage('Publicación editada.');
  };

  // prettier-ignore
  return <section class="space-y-8" aria-labelledby="admin-title"><header><h1 id="admin-title" class="text-3xl font-bold text-brand-navy">Administración</h1><p>Gestiona cuentas y todas las publicaciones. La base de datos autoriza cada acción.</p></header>{message && <p role="status">{message}</p>}<section aria-labelledby="users-title"><h2 id="users-title">Cuentas</h2>{users.length === 0 ? <p>No hay cuentas.</p> : <ul>{users.map((user) => <li key={user.id} class="flex flex-wrap items-center gap-2 py-2"><span>{user.display_name}</span><select aria-label={`Rol de ${user.display_name}`} value={user.role} onChange={(event) => void updateUser(user.id, { role: event.currentTarget.value as Role })}>{roles.map((role) => <option value={role}>{roleLabel(role)}</option>)}</select><button type="button" onClick={() => void updateUser(user.id, { suspended_at: user.suspended_at ? null : new Date().toISOString() })}>{user.suspended_at ? 'Reactivar' : 'Suspender'}</button></li>)}</ul>}</section><section aria-labelledby="posts-title"><h2 id="posts-title">Publicaciones</h2>{posts.length === 0 ? <p>No hay publicaciones.</p> : <div class="space-y-4">{posts.map((post) => <article key={post.id} class="rounded border p-4"><form onSubmit={(event) => void editPost(event, post.id)} class="space-y-2"><input name="slug" aria-label="Slug" defaultValue={post.slug} /><input name="title" aria-label="Título" defaultValue={post.title} /><textarea name="markdown" aria-label="Markdown" rows={5} defaultValue={post.markdown} /><button type="submit">Guardar edición</button></form><p>Estado: {post.status}</p><div class="flex gap-2">{post.status !== 'published' && <button type="button" onClick={() => void transition(post.id, 'published')}>Publicar</button>}{post.status !== 'archived' && <button type="button" onClick={() => void transition(post.id, 'archived')}>Archivar</button>}</div></article>)}</div>}</section></section>;
}
