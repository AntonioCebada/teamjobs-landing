# Autenticación, permisos y publicación

TeamJobs ofrece registro e inicio de sesión con Supabase. La autorización no depende de ocultar botones: PostgreSQL, los grants y RLS validan cada lectura y escritura. El navegador recibe únicamente la URL pública y una clave `publishable`; nunca una clave secreta o `service_role`.

## Ruta rápida local

1. Desde la raíz del repositorio, iniciá Supabase local con `docker compose run --rm supabase-cli start`.
2. Obtené `API_URL` y `PUBLISHABLE_KEY` con `docker compose run --rm supabase-cli status -o env`.
3. Copiá solo esos dos valores al archivo local ignorado `.env`, usando los nombres públicos indicados más abajo.
4. Ejecutá `docker compose up --build dev` y abrí `http://127.0.0.1:4321/auth/`.
5. Registrá una cuenta y comprobá sus permisos antes de asignar roles elevados.

## Rutas

| Ruta            | Propósito                                  | Acceso                                               |
| --------------- | ------------------------------------------ | ---------------------------------------------------- |
| `/auth/`        | Registro, inicio y cierre de sesión        | Público                                              |
| `/editor/`      | Creación y edición de borradores propios   | Editor o administrador activo                        |
| `/admin/`       | Gestión de usuarios, roles y publicaciones | Solo administrador activo                            |
| `/blog/`        | Listado de publicaciones                   | Público; muestra solo contenido publicado            |
| `/blog/<slug>/` | Detalle de una publicación                 | Público; no revela borradores ni contenido archivado |

El navbar de escritorio y el menú móvil muestran **Iniciar sesión**. El footer no incluye este acceso.

## Prerrequisitos

- Docker y Docker Compose disponibles.
- Dependencias instalables desde el lockfile con pnpm `10.34.5`.
- Supabase CLI `2.111.0`, provista por las dependencias del proyecto.
- Puertos de Supabase local y `4321` disponibles.
- Migración local aplicada antes de probar permisos.

No ejecutes estos pasos contra un proyecto alojado sin una aprobación operativa independiente.

## Registro e inicio de sesión

1. Abrí `/auth/` y elegí **Crear una cuenta**.
2. Ingresá nombre público, correo y contraseña.
3. La cuenta se crea siempre como **Lector**. El formulario no permite seleccionar ni modificar roles.
4. Si el entorno exige confirmación de correo, completala antes de iniciar sesión.
5. La sesión se conserva en `localStorage` del navegador y se elimina mediante **Cerrar sesión**.

Los lectores NO pueden autoelevarse a editor o administrador. Un cambio de rol requiere un administrador activo y además es validado por la base de datos.

## Matriz de permisos

| Acción                                | Lector | Editor | Administrador |
| ------------------------------------- | :----: | :----: | :-----------: |
| Leer publicaciones publicadas         |   Sí   |   Sí   |      Sí       |
| Consultar su propio perfil            |   Sí   |   Sí   |      Sí       |
| Crear y editar borradores propios     |   No   |   Sí   |      Sí       |
| Consultar borradores de otros autores |   No   |   No   |      Sí       |
| Cambiar roles o suspender cuentas     |   No   |   No   |      Sí       |
| Editar cualquier publicación          |   No   |   No   |      Sí       |
| Publicar o archivar                   |   No   |   No   |      Sí       |

Una cuenta suspendida deja de ser un usuario activo para las operaciones editoriales o administrativas. La base de datos también impide retirar o suspender al último administrador activo.

## Bootstrap del primer administrador

No existe un endpoint público ni una credencial de navegador para crear el primer administrador. El bootstrap es una acción fuera de banda para un mantenedor autorizado:

1. Creá la cuenta mediante `/auth/` y verificá su correo.
2. Confirmá que estás operando en el proyecto y entorno correctos.
3. Confirmá la identidad en `auth.users`: el correo debe estar verificado y corresponder al UUID esperado.
4. En el SQL Editor autorizado, sustituí ambos marcadores y ejecutá el bloque completo. La transacción solo llega a `commit` si la identidad coincide y se actualiza exactamente un perfil.
5. Conservá evidencia redactada de la aprobación y del resultado, sin incluir datos sensibles.

```sql
begin;

do $bootstrap$
declare
  expected_user_id uuid := '<uuid-verificado-del-administrador>';
  expected_email text := '<correo-verificado-del-administrador>';
  validated_user_id uuid;
  affected_rows integer;
begin
  select u.id
  into validated_user_id
  from auth.users as u
  where u.id = expected_user_id
    and lower(u.email) = lower(expected_email)
    and u.email_confirmed_at is not null
  for update;

  if validated_user_id is null then
    raise exception 'La identidad no coincide o el correo no está confirmado';
  end if;

  update public.profiles
  set role = 'admin', suspended_at = null
  where id = validated_user_id;

  get diagnostics affected_rows = row_count;

  if affected_rows <> 1 then
    raise exception 'Se esperaba actualizar exactamente un perfil; filas afectadas: %', affected_rows;
  end if;
end
$bootstrap$;

select p.id, p.role, p.suspended_at
from public.profiles as p
join auth.users as u on u.id = p.id
where u.id = '<uuid-verificado-del-administrador>'::uuid
  and lower(u.email) = lower('<correo-verificado-del-administrador>');

commit;
```

Si la identidad no coincide, el correo no está confirmado o la cantidad de filas afectadas no es exactamente una, la excepción aborta la transacción y evita la elevación; ejecutá `rollback` antes de corregir los marcadores y reintentar. No registres correos reales, UUID, tokens, contraseñas ni claves en documentación, logs compartidos o revisiones.

## Flujo de borrador y publicación

1. Un editor crea o modifica únicamente sus borradores desde `/editor/`.
2. Un editor no puede publicar, archivar ni escribir sobre publicaciones ajenas.
3. Un administrador revisa cualquier borrador desde `/admin/`, puede editarlo y es el único rol que puede publicarlo o archivarlo.
4. Al publicar, la base de datos asigna `published_at` cuando corresponde.
5. `/blog/` consume la proyección pública y expone solo publicaciones con estado `published`, sin correos ni roles internos.

## Configuración local para Docker dev

El cliente se ejecuta en el navegador. En un desarrollo donde Docker y el navegador corren en el mismo equipo, la URL local habitual `http://127.0.0.1:54321` es alcanzable desde el navegador aunque Astro se ejecute dentro del contenedor. No la reemplaces por el nombre interno de un servicio Docker: ese nombre no se resuelve desde el navegador.

Obtené siempre los valores de la instancia local activa:

```sh
docker compose run --rm supabase-cli start
docker compose run --rm supabase-cli status -o env
```

Copiá únicamente `API_URL` y `PUBLISHABLE_KEY` a `.env`:

```dotenv
PUBLIC_SUPABASE_URL=<valor-local-de-API_URL>
PUBLIC_SUPABASE_PUBLISHABLE_KEY=<valor-local-de-PUBLISHABLE_KEY>
```

Después ejecutá:

```sh
docker compose up --build dev
```

Ejecutá el helper desde la raíz del repositorio. Compose expande `${PWD}` y monta esa misma ruta absoluta como origen, destino y directorio de trabajo, porque la CLI y el daemon Docker deben resolver exactamente los mismos binds. El servicio usa el perfil opt-in `tools`, por lo que no arranca con `docker compose up dev`.

Compose pasa las dos variables públicas al build y al proceso de desarrollo. El comando `dev` falla de inmediato si falta alguna, en vez de servir rutas de autenticación inutilizables. `.env` permanece ignorado y fuera del contexto de build; `.env.example` solo declara nombres y no debe contener valores reales.

En una VM, un navegador remoto o Docker remoto, `127.0.0.1` apunta al equipo del navegador. Configurá `PUBLIC_SUPABASE_URL` con una URL HTTP(S) que ese navegador pueda alcanzar y publicá el puerto de la API de forma deliberada. No uses `host.docker.internal` salvo que el navegador también pueda resolverlo.

## Prueba manual

1. Abrí la página principal en escritorio y confirmá **Iniciar sesión** en el navbar, con destino `/auth/`.
2. Repetí la comprobación desde el menú móvil y confirmá que el footer no muestra ese acceso.
3. Registrá una cuenta nueva y verificá que aparece como Lector.
4. Intentá abrir `/editor/` con esa cuenta y confirmá la denegación.
5. Con cuentas de prueba asignadas fuera de banda, verificá que un editor administra solo sus borradores y no ve controles de publicación.
6. Verificá que un administrador gestiona roles, suspensiones y publicaciones.
7. Publicá un borrador como administrador y comprobá su aparición en `/blog/`; archivarlo debe retirarlo de la vista pública.

Usá identidades y datos descartables. No incluyas contraseñas en evidencia ni capturas.

## Prueba automatizada en Docker

El harness inicia una instancia local de Supabase, aplica la migración, carga datos sintéticos, obtiene la URL y clave `publishable` con `supabase status`, construye la aplicación y ejecuta Playwright:

```sh
docker compose run --rm test pnpm test:browser
```

La prueba cubre registro de lector, persistencia de sesión, denegación editorial, borradores de editor, administración, publicación y proyección pública. Al finalizar, el harness detiene los servicios con `supabase stop`, pero puede conservar el respaldo y los volúmenes de datos locales. Para eliminar esos datos de forma destructiva, exclusivamente en este entorno local, el comando explícito es `docker compose run --rm supabase-cli stop --project-id teamjobs-landing --no-backup`; no lo uses como limpieza rutinaria. El harness no reutiliza valores alojados ni expone claves privilegiadas al navegador.

Para verificaciones rápidas de código:

```sh
docker compose run --rm test pnpm vitest run tests/unit/navigation.test.ts tests/unit/footer-legal-compose.test.ts
docker compose run --rm test pnpm check
docker compose run --rm test pnpm lint
docker compose run --rm test pnpm format:check
git diff --check
```

## Resolución de problemas

| Síntoma                                                 | Comprobación                                                                                                                 |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Docker dev termina indicando una variable faltante      | Ejecutá `docker compose run --rm supabase-cli status -o env` y configurá solo `API_URL` y `PUBLISHABLE_KEY` como `PUBLIC_*`. |
| `/auth/` muestra un error genérico de autenticación     | Confirmá que Supabase local está activo, que la URL es absoluta y que la clave empieza con `sb_publishable_`.                |
| El navegador recibe `ERR_CONNECTION_REFUSED`            | Probá la URL de Supabase directamente desde el mismo navegador; revisá puertos y la frontera entre host, VM y navegador.     |
| Funciona desde el contenedor pero no desde el navegador | La URL usa un hostname interno de Docker. Cambiala por una dirección alcanzable desde el navegador.                          |
| Un editor no puede guardar                              | Confirmá que la cuenta está activa, tiene rol Editor y que intenta modificar un borrador propio.                             |
| Una publicación no aparece en el blog                   | Confirmá que un administrador la pasó a `published` y que tiene un slug válido.                                              |
| Un cambio de rol falla                                  | Verificá que actúa un administrador activo y que la operación no elimina al último administrador activo.                     |

Nunca soluciones un error de permisos agregando una clave `service_role` o secreta al frontend. Revisá la sesión, el perfil, los grants y las políticas RLS.

## Rollback

El acceso visual se revierte retirando el CTA dedicado de `Navbar.astro` y `MobileNav.tsx`, junto con `authHref` y su etiqueta. La validación local se revierte restaurando únicamente el comando `dev` de `docker-compose.yml`. Este rollback no requiere tocar el footer, las migraciones, RLS, usuarios ni datos alojados.
