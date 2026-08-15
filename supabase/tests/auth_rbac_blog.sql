begin;

select plan(42);

select has_schema('public', 'public schema exists');
select has_type('public', 'app_role', 'application role enum exists');
select has_type('public', 'post_status', 'post status enum exists');
select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'posts', 'posts table exists');
select has_column('public', 'profiles', 'role', 'profiles stores the database role');
select has_column('public', 'profiles', 'suspended_at', 'profiles stores suspension state');
select has_column('public', 'posts', 'author_id', 'posts store ownership');
select has_column('public', 'posts', 'markdown', 'posts store Markdown');
select has_index('public', 'posts', 'posts_slug_key', 'posts have a unique slug index');
select has_index('public', 'posts', 'posts_author_status_idx', 'posts have an ownership/status index');
select has_index('public', 'posts', 'posts_publication_idx', 'posts have a publication index');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'profiles have RLS enabled'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.posts'::regclass),
  'posts have RLS enabled'
);
select ok(
  has_table_privilege('anon', 'public.posts', 'select') is false,
  'anon cannot read the posts table directly'
);
select ok(
  has_table_privilege('authenticated', 'public.posts', 'insert'),
  'authenticated can reach posts for RLS-gated inserts'
);
select ok(
  has_function_privilege('anon', 'public.published_posts()', 'execute'),
  'anon can execute the public projection RPC'
);
select ok(
  has_function_privilege('anon', 'private.current_app_role()', 'execute') is false,
  'anon cannot execute private role helpers'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reader@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
  ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'editor@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Editor One"}', now(), now()),
  ('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'other-editor@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Editor Two"}', now(), now()),
  ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'suspended-editor@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Suspended Editor"}', now(), now()),
  ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-one@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Admin One"}', now(), now()),
  ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin-two@example.test', 'not-used', now(), '{"provider":"email","providers":["email"]}', '{"display_name":"Admin Two"}', now(), now());

update public.profiles
set role = case
  when id in ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000006') then 'admin'::public.app_role
  when id in ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000004') then 'editor'::public.app_role
  else 'reader'::public.app_role
end,
suspended_at = case
  when id = '00000000-0000-0000-0000-000000000004' then now()
  else null
end;

select is(
  (select role::text from public.profiles where id = '00000000-0000-0000-0000-000000000001'),
  'reader',
  'auth provisioning defaults every new user to reader'
);
select is(
  (select display_name from public.profiles where id = '00000000-0000-0000-0000-000000000002'),
  'Editor One',
  'profile display names may use presentation metadata without authorizing from it'
);
select ok(
  (select prosecdef from pg_proc where oid = 'private.handle_new_user()'::regprocedure),
  'auth provisioning runs as a hardened security definer'
);
select ok(
  position('on conflict (id) do nothing' in lower(pg_get_functiondef('private.handle_new_user()'::regprocedure))) > 0,
  'auth provisioning is idempotent'
);

insert into public.posts (author_id, slug, title, markdown, status, published_at)
values
  ('00000000-0000-0000-0000-000000000002', 'published-post', 'Published post', '# Published', 'published', now()),
  ('00000000-0000-0000-0000-000000000002', 'archived-post', 'Archived post', '# Archived', 'archived', null),
  ('00000000-0000-0000-0000-000000000003', 'other-draft', 'Other draft', '# Draft', 'draft', null),
  ('00000000-0000-0000-0000-000000000004', 'suspended-draft', 'Suspended draft', '# Draft', 'draft', null);

set local role anon;
select set_config('request.jwt.claim.role', 'anon', true);
select set_config('request.jwt.claim.sub', '', true);

select results_eq(
  $$select slug, title, markdown, author_name from public.published_posts()$$,
  $$values ('published-post'::text, 'Published post'::text, '# Published'::text, 'Editor One'::text)$$,
  'anon sees only published posts through the fixed RPC'
);
select results_eq(
  $$select key from (select to_jsonb(p) as payload from public.published_posts() p limit 1) rows, jsonb_object_keys(rows.payload) as keys(key) order by key$$,
  $$values ('author_name'::text), ('markdown'::text), ('published_at'::text), ('slug'::text), ('title'::text)$$,
  'the public RPC exposes approved fields and no email'
);
select throws_ok(
  $$select count(*) from public.posts$$,
  '42501',
  null,
  'anon cannot bypass the public projection with direct table access'
);

set local role authenticated;
select set_config('request.jwt.claim.role', 'authenticated', true);
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000001', true);

select results_eq(
  $$select count(*) from public.posts where status <> 'published'::public.post_status$$,
  $$values (0::bigint)$$,
  'reader cannot see non-published posts'
);
select throws_ok(
  $$insert into public.posts (author_id, slug, title) values ('00000000-0000-0000-0000-000000000001', 'reader-draft', 'Reader draft')$$,
  '42501',
  null,
  'reader cannot create editorial content'
);
select throws_ok(
  $$update public.profiles set role = 'admin'::public.app_role where id = '00000000-0000-0000-0000-000000000001'$$,
  '42501',
  null,
  'reader cannot self-promote'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000002', true);
select lives_ok(
  $$insert into public.posts (author_id, slug, title, markdown) values ('00000000-0000-0000-0000-000000000002', 'editor-draft', 'Editor draft', '# Draft')$$,
  'active editor can create an own draft'
);
select results_eq(
  $$select count(*) from public.posts where author_id = '00000000-0000-0000-0000-000000000002' and status = 'draft'::public.post_status$$,
  $$values (1::bigint)$$,
  'editor can read the own draft'
);
select results_eq(
  $$update public.posts set markdown = '# Hacked' where slug = 'other-draft' returning id$$,
  $$select null::uuid where false$$,
  'editor cannot target another author draft'
);
select throws_ok(
  $$update public.posts set status = 'published'::public.post_status where slug = 'editor-draft'$$,
  '42501',
  null,
  'editor cannot publish a draft'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000004', true);
select throws_ok(
  $$insert into public.posts (author_id, slug, title) values ('00000000-0000-0000-0000-000000000004', 'suspended-new-draft', 'Suspended draft')$$,
  '42501',
  null,
  'suspended editor cannot create a draft'
);
select results_eq(
  $$with attempted as (
    update public.posts set markdown = '# Hacked' where slug = 'suspended-draft' returning id
  )
  select id from attempted$$,
  $$select null::uuid where false$$,
  'suspended editor cannot update a draft'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select lives_ok(
  $$update public.profiles set role = 'editor'::public.app_role where id = '00000000-0000-0000-0000-000000000001'$$,
  'active admin can assign the editor role'
);
select lives_ok(
  $$update public.posts set status = 'published'::public.post_status where slug = 'other-draft'$$,
  'active admin can publish any draft'
);
select results_eq(
  $$select count(*) from public.published_posts() where slug = 'other-draft'$$,
  $$values (1::bigint)$$,
  'an admin publication is visible through the public RPC'
);
select lives_ok(
  $$update public.profiles set suspended_at = now() where id = '00000000-0000-0000-0000-000000000003'$$,
  'active admin can suspend an account'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000003', true);
select throws_ok(
  $$insert into public.posts (author_id, slug, title) values ('00000000-0000-0000-0000-000000000003', 'suspended-by-admin', 'Suspended')$$,
  '42501',
  null,
  'an account suspended by an admin cannot create a draft'
);

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-000000000005', true);
select lives_ok(
  $$update public.profiles set role = 'reader'::public.app_role where id = '00000000-0000-0000-0000-000000000006'$$,
  'an admin can change a role while another active admin remains'
);
select throws_ok(
  $$update public.profiles set role = 'reader'::public.app_role where id = '00000000-0000-0000-0000-000000000005'$$,
  'P0001',
  'cannot demote or suspend the last active admin',
  'the last active admin cannot be demoted'
);
select throws_ok(
  $$update public.profiles set suspended_at = now() where id = '00000000-0000-0000-0000-000000000005'$$,
  'P0001',
  'cannot demote or suspend the last active admin',
  'the last active admin cannot be suspended'
);

select * from finish();
rollback;
