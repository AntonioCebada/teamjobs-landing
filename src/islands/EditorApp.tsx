import { useEffect, useState } from 'preact/hooks';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import {
  canAccessRole,
  isActiveProfile,
  safeDataError,
  useAuthSnapshot,
  type Post,
} from './auth-session';

type Draft = Pick<
  Post,
  'id' | 'author_id' | 'slug' | 'title' | 'markdown' | 'status' | 'updated_at'
>;
const blank = { slug: '', title: '', markdown: '' };

export default function EditorApp() {
  const snapshot = useAuthSnapshot();
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [form, setForm] = useState(blank);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (
      snapshot.status !== 'authenticated' ||
      !canAccessRole(snapshot.profile.role, 'editor') ||
      !isActiveProfile(snapshot.profile)
    )
      return;
    const client = getSupabaseBrowserClient();
    let mounted = true;
    void client
      .from('posts')
      .select('id,author_id,slug,title,markdown,status,updated_at')
      .eq('author_id', snapshot.user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setMessage(safeDataError(error));
          setState('error');
          return;
        }
        setDrafts((data ?? []) as Draft[]);
        setState('ready');
      });
    return () => {
      mounted = false;
    };
  }, [snapshot]);

  if (snapshot.status === 'loading')
    return <p role="status">Cargando editor…</p>;
  if (snapshot.status === 'error')
    return <p role="alert">{snapshot.message}</p>;
  if (
    snapshot.status === 'anonymous' ||
    !canAccessRole(snapshot.profile.role, 'editor') ||
    !isActiveProfile(snapshot.profile)
  )
    return (
      <section>
        <h1>Editor</h1>
        <p role="alert">No tienes permisos para administrar borradores.</p>
        <a href="/auth">Inicia sesión con una cuenta autorizada.</a>
      </section>
    );
  if (state === 'loading') return <p role="status">Cargando editor…</p>;
  if (state === 'error') return <p role="alert">{message}</p>;

  const choose = (draft: Draft) => {
    setSelected(draft.id);
    setForm({ slug: draft.slug, title: draft.title, markdown: draft.markdown });
  };
  const save = async (event: Event) => {
    event.preventDefault();
    setMessage('');
    const values = {
      slug: form.slug.trim(),
      title: form.title.trim(),
      markdown: form.markdown,
    };
    const client = getSupabaseBrowserClient();
    const result = selected
      ? await client
          .from('posts')
          .update(values)
          .eq('id', selected)
          .eq('author_id', snapshot.user.id)
          .select('id,author_id,slug,title,markdown,status,updated_at')
          .single()
      : await client
          .from('posts')
          .insert({ ...values, author_id: snapshot.user.id, status: 'draft' })
          .select('id,author_id,slug,title,markdown,status,updated_at')
          .single();
    if (result.error || !result.data) {
      setMessage(safeDataError(result.error));
      return;
    }
    setDrafts((current) =>
      selected
        ? current.map((draft) =>
            draft.id === selected ? (result.data as Draft) : draft,
          )
        : [result.data as Draft, ...current],
    );
    setSelected((result.data as Draft).id);
    setForm(values);
    setMessage('Borrador guardado.');
  };

  // prettier-ignore
  return <section class="space-y-6" aria-labelledby="editor-title"><header><h1 id="editor-title" class="text-3xl font-bold text-brand-navy">Borradores</h1><p>Gestiona únicamente tus borradores.</p></header>{message && <p role="status">{message}</p>}{drafts.length === 0 && <p role="status">No hay borradores todavía.</p>}{drafts.length > 0 && <ul aria-label="Tus borradores">{drafts.map((draft) => <li key={draft.id}><button type="button" onClick={() => choose(draft)}>{draft.title}</button></li>)}</ul>}<form class="max-w-2xl space-y-3" onSubmit={save}><h2>{selected ? 'Editar borrador' : 'Nuevo borrador'}</h2><label htmlFor="draft-slug">Slug</label><input id="draft-slug" required value={form.slug} onInput={(event) => setForm({ ...form, slug: event.currentTarget.value })} /><label htmlFor="draft-title">Título</label><input id="draft-title" required value={form.title} onInput={(event) => setForm({ ...form, title: event.currentTarget.value })} /><label htmlFor="draft-markdown">Markdown</label><textarea id="draft-markdown" rows={12} value={form.markdown} onInput={(event) => setForm({ ...form, markdown: event.currentTarget.value })} /><button type="submit">Guardar borrador</button></form></section>;
}
