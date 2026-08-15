import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { useEffect, useState } from 'preact/hooks';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import type { Database } from '../lib/supabase/database';

export type Role = Database['public']['Enums']['app_role'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Post = Database['public']['Tables']['posts']['Row'];
export type BrowserClient = SupabaseClient<Database>;

export type AuthSnapshot =
  | { status: 'loading' }
  | { status: 'anonymous' }
  | { status: 'authenticated'; user: User; profile: Profile }
  | { status: 'error'; message: string };

export const roleLabel = (role: Role) =>
  ({ reader: 'Lector', editor: 'Editor', admin: 'Administrador' })[role];

export const canAccessRole = (role: Role, required: Role) =>
  role === required || (required === 'editor' && role === 'admin');

export const isActiveProfile = (profile: Profile) =>
  profile.suspended_at === null;

export function authErrorMessage(_error: unknown): string {
  return 'No se pudo completar la autenticación. Verifica tus datos e inténtalo de nuevo.';
}

export function safeDataError(error: unknown): string {
  const detail =
    error && typeof error === 'object' && 'message' in error
      ? String(error.message).toLowerCase()
      : '';
  if (detail.includes('last active admin'))
    return 'No se puede retirar al último administrador activo.';
  if (detail.includes('permission') || detail.includes('42501'))
    return 'La base de datos rechazó esta acción por permisos.';
  return 'No se pudo completar la acción. Inténtalo de nuevo.';
}

export async function loadAuthSnapshot(
  client: BrowserClient,
  providedSession?: Session | null,
): Promise<AuthSnapshot> {
  try {
    const sessionResult =
      providedSession === undefined
        ? await client.auth.getSession()
        : { data: { session: providedSession }, error: null };
    if (sessionResult.error)
      return {
        status: 'error',
        message: authErrorMessage(sessionResult.error),
      };
    const session = sessionResult.data.session;
    if (!session) return { status: 'anonymous' };
    const { data, error } = await client
      .from('profiles')
      .select('id,display_name,role,suspended_at,created_at,updated_at')
      .eq('id', session.user.id)
      .maybeSingle();
    if (error || !data)
      return {
        status: 'error',
        message: 'No se pudo cargar el perfil de la cuenta.',
      };
    return { status: 'authenticated', user: session.user, profile: data };
  } catch (error) {
    return { status: 'error', message: authErrorMessage(error) };
  }
}

export function useAuthSnapshot(): AuthSnapshot {
  const [client, setClient] = useState<BrowserClient | null>(null);
  const [clientError, setClientError] = useState('');
  const [snapshot, setSnapshot] = useState<AuthSnapshot>({ status: 'loading' });

  useEffect(() => {
    try {
      setClient(getSupabaseBrowserClient());
    } catch (error) {
      setClientError(authErrorMessage(error));
    }
  }, []);

  useEffect(() => {
    if (!client) return;
    let mounted = true;
    const load = (session?: Session | null) => {
      void loadAuthSnapshot(client, session).then(
        (next) => mounted && setSnapshot(next),
      );
    };
    load();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setTimeout(() => mounted && load(session), 0);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [client]);

  if (clientError) return { status: 'error', message: clientError };
  return snapshot;
}
