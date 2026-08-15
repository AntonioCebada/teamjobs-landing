create schema if not exists private;

revoke all on schema private from public, anon, authenticated, service_role;

create type public.app_role as enum ('reader', 'editor', 'admin');
create type public.post_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default 'Reader',
  role public.app_role not null default 'reader',
  suspended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_check check (
    char_length(display_name) between 1 and 100
    and display_name = btrim(display_name)
  )
);

create table public.posts (
  id uuid primary key default extensions.gen_random_uuid(),
  author_id uuid not null references public.profiles (id) on delete restrict,
  slug text not null,
  title text not null,
  markdown text not null default '',
  status public.post_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_key unique (slug),
  constraint posts_slug_check check (
    char_length(slug) between 1 and 160
    and slug = lower(slug)
    and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
  ),
  constraint posts_title_check check (
    char_length(title) between 1 and 200
    and title = btrim(title)
  ),
  constraint posts_published_at_check check (
    status <> 'published' or published_at is not null
  )
);

create index profiles_active_admin_idx
  on public.profiles (id)
  where role = 'admin' and suspended_at is null;

create index posts_author_status_idx
  on public.posts (author_id, status);

create index posts_publication_idx
  on public.posts (published_at desc, created_at desc)
  where status = 'published';

create or replace function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $function$
  select p.role
  from public.profiles as p
  where p.id = (select auth.uid())
    and p.suspended_at is null
$function$;

create or replace function private.is_active_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select p_user_id is not null
    and p_user_id = (select auth.uid())
    and exists (
      select 1
      from public.profiles as p
      where p.id = p_user_id
        and p.suspended_at is null
    )
$function$;

create or replace function private.is_active_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select (select private.current_app_role()) = 'admin'::public.app_role
$function$;

create or replace function private.guard_profile_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role := (select private.current_app_role());
  active_admin_count integer;
begin
  if new.id is distinct from old.id then
    raise exception using
      errcode = '22000',
      message = 'profile identity cannot change';
  end if;

  if actor_id is not null
     and coalesce(actor_role <> 'admin'::public.app_role, true)
     and not (
       actor_id = old.id
       and (select private.is_active_user(actor_id))
     ) then
    raise exception using
      errcode = '42501',
      message = 'only an active admin may manage profiles';
  end if;

  if actor_id is not null
     and coalesce(actor_role <> 'admin'::public.app_role, true)
     and (
       new.role is distinct from old.role
       or new.suspended_at is distinct from old.suspended_at
     ) then
    raise exception using
      errcode = '42501',
      message = 'users cannot change their own role or suspension';
  end if;

  if old.role = 'admin'::public.app_role
     and old.suspended_at is null
     and (
       new.role is distinct from 'admin'::public.app_role
       or new.suspended_at is not null
     ) then
    perform pg_catalog.pg_advisory_xact_lock(4217001::bigint);

    select count(*)
      into active_admin_count
      from public.profiles as p
      where p.role = 'admin'::public.app_role
        and p.suspended_at is null;

    if active_admin_count <= 1 then
      raise exception using
        errcode = 'P0001',
        message = 'cannot demote or suspend the last active admin';
    end if;
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function private.guard_post_write()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
declare
  actor_id uuid := (select auth.uid());
  actor_role public.app_role := (select private.current_app_role());
begin
  if tg_op = 'UPDATE' and new.id is distinct from old.id then
    raise exception using
      errcode = '22000',
      message = 'post identity cannot change';
  end if;

  if actor_id is not null then
    if actor_role = 'editor'::public.app_role then
      if tg_op = 'INSERT' then
        if new.author_id is distinct from actor_id
           or new.status is distinct from 'draft'::public.post_status
           or new.published_at is not null then
          raise exception using
            errcode = '42501',
            message = 'editors may create only their own drafts';
        end if;
      elsif old.author_id is distinct from actor_id
            or old.status is distinct from 'draft'::public.post_status
            or new.author_id is distinct from actor_id
            or new.status is distinct from 'draft'::public.post_status
            or new.published_at is not null then
        raise exception using
          errcode = '42501',
          message = 'editors may update only their own drafts';
      end if;
    elsif coalesce(actor_role <> 'admin'::public.app_role, true) then
      raise exception using
        errcode = '42501',
        message = 'only active editors and admins may manage posts';
    end if;
  end if;

  if new.status = 'published'::public.post_status
     and new.published_at is null then
    new.published_at := pg_catalog.now();
  end if;

  new.updated_at := pg_catalog.now();
  return new;
end;
$function$;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, display_name, role)
  values (
    new.id,
    pg_catalog.left(
      coalesce(
        nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'display_name'), ''),
        nullif(pg_catalog.btrim(new.raw_user_meta_data ->> 'full_name'), ''),
        nullif(pg_catalog.split_part(new.email, '@', 1), ''),
        'Reader'
      ),
      100
    ),
    'reader'::public.app_role
  )
  on conflict (id) do nothing;

  return new;
end;
$function$;

create or replace function public.published_posts()
returns table (
  slug text,
  title text,
  markdown text,
  author_name text,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $function$
  select
    p.slug,
    p.title,
    p.markdown,
    profile.display_name as author_name,
    p.published_at
  from public.posts as p
  join public.profiles as profile on profile.id = p.author_id
  where p.status = 'published'::public.post_status
  order by p.published_at desc, p.created_at desc, p.id
$function$;

create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row
  execute function private.handle_new_user();

create trigger profiles_update_guard
  before update on public.profiles
  for each row
  execute function private.guard_profile_update();

create trigger posts_write_guard
  before insert or update on public.posts
  for each row
  execute function private.guard_post_write();

alter table public.profiles enable row level security;
alter table public.posts enable row level security;

create policy profiles_select_self_or_admin
  on public.profiles
  for select
  to authenticated
  using (
    (select private.is_active_admin())
    or (select auth.uid()) = id
  );

create policy profiles_update_self_or_admin
  on public.profiles
  for update
  to authenticated
  using (
    (select private.is_active_admin())
    or (select private.is_active_user((select auth.uid())))
  )
  with check (
    (select private.is_active_admin())
    or (select private.is_active_user((select auth.uid())))
  );

create policy posts_select_published_or_editorial
  on public.posts
  for select
  to authenticated
  using (
    status = 'published'::public.post_status
    or (select private.current_app_role()) = 'admin'::public.app_role
    or (
      (select private.current_app_role()) = 'editor'::public.app_role
      and author_id = (select auth.uid())
      and status = 'draft'::public.post_status
    )
  );

create policy posts_insert_editorial
  on public.posts
  for insert
  to authenticated
  with check (
    (
      (select private.current_app_role()) = 'admin'::public.app_role
      or (
        (select private.current_app_role()) = 'editor'::public.app_role
        and author_id = (select auth.uid())
        and status = 'draft'::public.post_status
        and published_at is null
      )
    )
  );

create policy posts_update_editorial
  on public.posts
  for update
  to authenticated
  using (
    (select private.current_app_role()) = 'admin'::public.app_role
    or (
      (select private.current_app_role()) = 'editor'::public.app_role
      and author_id = (select auth.uid())
      and status = 'draft'::public.post_status
    )
  )
  with check (
    (select private.current_app_role()) = 'admin'::public.app_role
    or (
      (select private.current_app_role()) = 'editor'::public.app_role
      and author_id = (select auth.uid())
      and status = 'draft'::public.post_status
      and published_at is null
    )
  );

create policy posts_delete_admin
  on public.posts
  for delete
  to authenticated
  using ((select private.is_active_admin()));

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.posts from public, anon, authenticated;
grant select, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.posts to authenticated;

revoke all on function private.current_app_role() from public, anon, authenticated, service_role;
revoke all on function private.is_active_user(uuid) from public, anon, authenticated, service_role;
revoke all on function private.is_active_admin() from public, anon, authenticated, service_role;
grant usage on schema private to authenticated;
grant execute on function private.current_app_role() to authenticated;
grant execute on function private.is_active_user(uuid) to authenticated;
grant execute on function private.is_active_admin() to authenticated;

  revoke all on function private.handle_new_user() from public, anon, authenticated, service_role;
  revoke all on function private.guard_profile_update() from public, anon, authenticated, service_role;
  revoke all on function private.guard_post_write() from public, anon, authenticated, service_role;
  grant usage on schema private to supabase_auth_admin;
  grant execute on function private.handle_new_user() to supabase_auth_admin;
  grant execute on function private.guard_profile_update() to authenticated;
  grant execute on function private.guard_post_write() to authenticated;

revoke all on function public.published_posts() from public, anon, authenticated;
grant execute on function public.published_posts() to anon, authenticated;
