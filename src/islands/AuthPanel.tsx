import { useState } from 'preact/hooks';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { authErrorMessage, roleLabel, useAuthSnapshot } from './auth-session';

type Mode = 'login' | 'signup';

export default function AuthPanel() {
  const snapshot = useAuthSnapshot();
  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (snapshot.status === 'loading')
    return <p role="status">Cargando sesión…</p>;
  if (snapshot.status === 'error')
    return <p role="alert">{snapshot.message}</p>;
  if (snapshot.status === 'authenticated') {
    const { profile } = snapshot;
    // prettier-ignore
    return <section aria-labelledby="auth-session-title" class="space-y-4"><h1 id="auth-session-title" class="text-3xl font-bold text-brand-navy">Sesión activa</h1><p>{profile.display_name} · {roleLabel(profile.role)}</p><p role="status">Tu sesión se conserva en este navegador.</p><div class="flex flex-wrap gap-3">{profile.role !== 'reader' && <a class="rounded-full bg-brand-blue px-5 py-2 font-semibold text-white" href={profile.role === 'admin' ? '/admin' : '/editor'}>Abrir panel</a>}<button type="button" class="rounded-full border px-5 py-2 font-semibold" onClick={() => void getSupabaseBrowserClient().auth.signOut()}>Cerrar sesión</button></div></section>;
  }

  const submit = async (event: Event) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const client = getSupabaseBrowserClient();
    const result =
      mode === 'signup'
        ? await client.auth.signUp({
            email,
            password,
            options: { data: { display_name: displayName } },
          })
        : await client.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (result.error) setMessage(authErrorMessage(result.error));
    else if (mode === 'signup' && !result.data.session)
      setMessage(
        'La cuenta fue creada; la sesión estará disponible cuando termine la confirmación configurada.',
      );
    else setMessage('Sesión disponible.');
  };

  // prettier-ignore
  return <form class="max-w-md space-y-4" onSubmit={submit}><h1 class="text-3xl font-bold text-brand-navy">{mode === 'signup' ? 'Crear cuenta' : 'Iniciar sesión'}</h1><p>Las cuentas nuevas empiezan con el rol Lector.</p>{mode === 'signup' && <div><label htmlFor="display-name">Nombre público</label><input id="display-name" name="displayName" value={displayName} onInput={(event) => setDisplayName(event.currentTarget.value)} /></div>}<div><label htmlFor="auth-email">Correo electrónico</label><input id="auth-email" name="email" type="email" required autoComplete="email" value={email} onInput={(event) => setEmail(event.currentTarget.value)} /></div><div><label htmlFor="auth-password">Contraseña</label><input id="auth-password" name="password" type="password" required minLength={6} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} value={password} onInput={(event) => setPassword(event.currentTarget.value)} /></div>{message && <p role="status">{message}</p>}<button type="submit" disabled={busy}>{busy ? 'Procesando…' : mode === 'signup' ? 'Crear cuenta' : 'Entrar'}</button><button type="button" onClick={() => { setMode(mode === 'signup' ? 'login' : 'signup'); setMessage(''); }}>{mode === 'signup' ? 'Ya tengo una cuenta' : 'Crear una cuenta'}</button></form>;
}
