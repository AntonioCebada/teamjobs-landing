# Operación del cambio de cuentas y blog

Este documento resume el orden operativo para revisar y desplegar el cambio de
cuentas, roles y publicaciones. Es una guía de ejecución y evidencia; no
sustituye la revisión del esquema, la aprobación del mantenedor ni la aprobación
de la redacción de privacidad y cookies.

## Ruta rápida

1. Aplicar la migración en el entorno autorizado.
2. Ejecutar pgTAP y los asesores de Supabase; detenerse ante cualquier fallo.
3. Verificar el cliente y la interfaz únicamente después de esas pruebas.
4. Registrar evidencia local y solicitar por separado las acciones alojadas.

## Orden de migración y verificación

| Orden | Comprobación                                                                                                                                                      | Evidencia que debe conservarse                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | La migración de `supabase/migrations/` crea perfiles, publicaciones, roles, RLS, guardas y la proyección pública.                                                 | Nombre de la migración y salida exitosa del reset local.                      |
| 2     | `supabase/tests/auth_rbac_blog.sql` prueba aprovisionamiento, límites por rol, suspensión, último administrador y la ausencia de correo en la proyección pública. | Resultado pgTAP: pruebas planeadas, ejecutadas, aprobadas y fallidas.         |
| 3     | Los asesores revisan permisos, funciones y RLS.                                                                                                                   | Salida completa de `supabase db advisors --local --type all --fail-on error`. |
| 4     | El cliente, el blog y las rutas de cuenta se comprueban en la interfaz.                                                                                           | Prueba enfocada, `check`, lint, formato, build y rutas verificadas.           |

En el flujo canónico, los comandos se ejecutan dentro de Docker con la versión
de pnpm y de la CLI fijadas por el repositorio. La secuencia local equivalente
es:

```text
docker compose run --rm supabase-cli start
docker compose run --rm supabase-cli db reset --local --no-seed
docker compose run --rm supabase-cli db test --local supabase/tests/auth_rbac_blog.sql
docker compose run --rm supabase-cli db advisors --local --type all --fail-on error
docker compose build preview
```

Los nombres anteriores describen el orden, no una autorización para ejecutar
contra un proyecto alojado. La migración alojada es una acción independiente de
un mantenedor autorizado y debe revisarse, programarse y ejecutarse mediante el
procedimiento del proyecto. Esta unidad no ejecuta migraciones alojadas ni
confirma que se hayan ejecutado.

## Límite del helper local de Supabase

Cuando la CLI corre dentro de un contenedor y crea contenedores locales de
Supabase a través del socket de Docker, el repositorio debe estar montado con la
misma ruta absoluta del equipo anfitrión tanto en el bind mount como en el
directorio de trabajo. No se debe sustituir esa ruta por `/app` si el host usa
otra ruta: la CLI trasladaría binds que los contenedores creados no pueden
resolver.

El servicio `supabase-cli` implementa ese límite con `${PWD}`. Ejecute siempre
Compose desde la raíz del repositorio; la variable se valida antes de crear el
contenedor y se usa como origen, destino y directorio de trabajo. La sintaxis es:

```text
docker compose run --rm supabase-cli <argumentos-de-supabase>
```

El helper usa la CLI `2.111.0`, `docker-cli` instalado en la imagen, el socket de
Docker y red de host. Está bajo el perfil `tools`, así que no arranca con el
servicio `dev`. No recibe claves de aplicación ni debe inspeccionar, imprimir o
copiar secretos.

## Primer administrador: bootstrap fuera de banda

No existe una ruta pública de autoelevación. Después de que la cuenta haya sido
creada por el flujo normal, un mantenedor autorizado debe identificarla por un
correo ya verificado y ejecutar el cambio en el SQL Editor del proyecto
correspondiente. Sustituya los marcadores; nunca documente una identidad real:

```sql
-- Solo para un mantenedor autorizado en el entorno aprobado.
update public.profiles
set role = 'admin', suspended_at = null
where id = (
  select id from auth.users where email = '<admin-email>'
);

-- Evidencia mínima: una fila, el identificador esperado, admin y sin suspensión.
select p.id, p.role, p.suspended_at
from public.profiles as p
join auth.users as u on u.id = p.id
where u.email = '<admin-email>';
```

La evidencia debe registrar el identificador de la cuenta de forma redactada o
mediante el sistema autorizado, el rol observado, `suspended_at` nulo y quién
aprobó la acción. No se deben pegar en el repositorio, terminales compartidas o
revisiones correos reales, contraseñas, tokens, claves ni valores privados del
proyecto.

## Configuración pública de build

`PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_PUBLISHABLE_KEY` se proporcionan solo
como argumentos de build para generar la aplicación estática. Deben venir del
entorno de ejecución controlado, no de archivos confirmados ni de valores
escritos en el código. El navegador solo recibe la URL pública y la clave
publishable; nunca se debe usar una clave `service_role` o secreta en el cliente.

No se deben agregar valores reales a ejemplos, logs, snapshots, documentación o
variables persistentes del repositorio. La presencia de una variable `PUBLIC_*`
no autoriza a ejecutar una operación alojada.

## Lista de rollback y verificación

### Rollback

- Restaurar la imagen estática anterior si la interfaz o la autorización no pasa
  la verificación.
- Revocar los grants y la RPC públicos únicamente mediante una migración revisada
  y aprobada; no editar el esquema alojado a mano como sustituto.
- Conservar cuentas y publicaciones. Preferir una migración correctiva revisada
  a una eliminación destructiva.
- Para esta unidad de documentación y borradores, revertir únicamente
  `src/pages/privacidad.astro`, `src/pages/cookies.astro`,
  `tests/unit/footer-legal-compose.test.ts`, este documento y las evidencias del
  cambio. No tocar migraciones, RLS, autenticación, blog ni el proyecto alojado.

### Verificación

- [ ] La migración local se aplicó antes de probar la interfaz.
- [ ] pgTAP terminó con todas las pruebas aprobadas.
- [ ] Los asesores terminaron sin errores.
- [ ] `PUBLIC_SUPABASE_URL` y `PUBLIC_SUPABASE_PUBLISHABLE_KEY` solo se usaron en
      build y no contienen valores confirmados en el repositorio.
- [ ] `/auth`, `/editor`, `/admin` y `/blog` respetan los límites de rol; el blog
      público no muestra correos ni roles.
- [x] `/privacidad` y `/cookies` describen el comportamiento implementado y la
      aprobación del mantenedor del proyecto para ambos borradores fácticos actuales
      en español se registró el 12 de agosto de 2026; cualquier revisión legal externa
      sigue siendo opcional/futura y no se afirma que haya ocurrido.
- [ ] Las acciones alojadas y el bootstrap administrativo tienen evidencia
      separada; este documento no implica que se hayan ejecutado.
