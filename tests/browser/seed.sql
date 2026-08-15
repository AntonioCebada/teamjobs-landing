insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  confirmation_token, recovery_token, email_change_token_new, email_change,
  phone_change, phone_change_token, email_change_token_current,
  reauthentication_token, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'editor.browser@example.test', extensions.crypt('TeamJobs123!', extensions.gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"display_name":"Editor browser"}', now(), now()),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin.browser@example.test', extensions.crypt('TeamJobs123!', extensions.gen_salt('bf')), now(), '', '', '', '', '', '', '', '', '{"provider":"email","providers":["email"]}', '{"display_name":"Admin browser"}', now(), now())
on conflict (id) do nothing;

update public.profiles
set role = case id
  when '10000000-0000-0000-0000-000000000001' then 'editor'::public.app_role
  when '10000000-0000-0000-0000-000000000002' then 'admin'::public.app_role
end,
suspended_at = null
where id in ('10000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002');

insert into public.posts (author_id, slug, title, markdown, status)
values
  ('10000000-0000-0000-0000-000000000001', 'browser-draft', 'Borrador de prueba', $$# Borrador

<script>window.__blogXss = true</script>

<a href="javascript:alert(1)" onclick="window.__blogXss = true">Enlace inseguro</a>

<img src="x" onerror="window.__blogXss = true">$$, 'draft'),
  ('10000000-0000-0000-0000-000000000001', 'browser-private-draft', 'Borrador privado', '# Privado', 'draft'),
  ('10000000-0000-0000-0000-000000000001', 'browser-archived', 'Publicación archivada', '# Archivada', 'archived')
on conflict (slug) do update set
  status = excluded.status,
  published_at = excluded.published_at,
  title = excluded.title,
  markdown = excluded.markdown;
