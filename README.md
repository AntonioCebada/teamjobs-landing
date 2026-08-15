# Incorporación de desarrolladores a TeamJobs Landing

TeamJobs Landing es un sitio de aterrizaje estático de Astro para el producto
TeamJobs. Este repositorio contiene actualmente la experiencia de frontend, una
interfaz de blog estática, herramientas locales de desarrollo y el vínculo con
la CLI y el proyecto de Supabase. La aplicación todavía no integra una base de
datos activa, autenticación, un CMS ni el SDK cliente de Supabase.

## Estado actual

| Área                    | Estado actual                                                                                                                                                                                                                   |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend                | Astro `5.18.2` con TypeScript `5.9.3`, Preact `10.29.7` y Tailwind CSS `4.0.17`.                                                                                                                                                |
| Renderizado             | Salida estática (`output: 'static'`) generada por Astro y servida por nginx en la imagen de producción.                                                                                                                         |
| Calidad                 | Las pruebas unitarias de Vitest, Astro Check, ESLint y Prettier están configuradas.                                                                                                                                             |
| Herramientas de backend | La CLI de Supabase `2.111.0` y `supabase/config.toml` están disponibles; el vínculo con el proyecto alojado se mantiene como metadatos ignorados propios de cada desarrollador.                                                 |
| Integración de backend  | No implementada. `@supabase/supabase-js` y `@supabase/ssr` no están instalados.                                                                                                                                                 |
| Autenticación           | No implementada. La configuración local de URL de Auth de Supabase todavía usa el puerto `3000`; actualizarla a `4321` es una tarea futura de configuración previa a la autenticación, no un requisito de configuración actual. |

## Inicio rápido: flujo de trabajo con Docker

Docker es el entorno canónico y reproducible. Fija Node.js `22.14.0` y pnpm
`10.34.5`, por lo que no es necesario instalar Node.js en el equipo anfitrión
para el flujo normal.

Desde un clon nuevo:

```bash
git clone <repository-url>
cd teamjobs-landing
docker compose up --build -d dev
docker compose ps dev
curl --fail --silent --show-error http://localhost:4321/ >/dev/null && echo "TeamJobs Landing is ready"
```

Abra [http://localhost:4321](http://localhost:4321). El servicio `dev` observa
el árbol de código fuente montado y ejecuta Astro en `0.0.0.0:4321`.

Siga los registros de desarrollo cuando sea necesario:

```bash
docker compose logs -f dev
```

Detenga y elimine el contenedor de desarrollo y la red de Compose mediante el
comando normal y seguro de limpieza:

```bash
docker compose down
```

Para eliminar también el volumen de dependencias con nombre y forzar una nueva
instalación de dependencias la próxima vez, use esto solo cuando el reinicio
sea intencional:

```bash
docker compose down --volumes
```

## Requisitos previos

### Requeridos para el flujo canónico

- Git.
- Docker Engine o Docker Desktop con Docker Compose v2, disponible como
  `docker compose`.
- Un navegador para el sitio local.

Verifique las herramientas de contenedores antes de comenzar:

```bash
git --version
docker --version
docker compose version
```

### Requeridos solo para la alternativa del equipo anfitrión

Use la cadena de herramientas fijada por el repositorio al ejecutar fuera de
Docker:

- Node.js `22.14.0` (la versión fijada en el Dockerfile).
- pnpm `10.34.5` (la versión fijada en `package.json` mediante
  `packageManager`).

Active la versión fijada de pnpm con Corepack y luego instale desde el archivo
de bloqueo:

```bash
node --version
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm --version
pnpm install --frozen-lockfile
```

El equipo anfitrión puede tener una versión más reciente de Node.js con número
par, pero esa no es la garantía de reproducibilidad del repositorio. Prefiera
Docker cuando sea importante utilizar el entorno de ejecución exacto. La
documentación oficial actual de Astro describe los requisitos de versiones más
nuevas de Astro; no infiera a partir de ella una matriz de compatibilidad más
amplia para este proyecto Astro 5.

### Herramientas opcionales

- La CLI de Playwright para la verificación en el navegador. **No** es una
  dependencia del paquete del proyecto; consulte [CLI de Playwright](#cli-de-playwright).
- La CLI de Supabase **no** es un requisito global. Es la dependencia de
  desarrollo local exacta `supabase@2.111.0` y debe invocarse desde la raíz
  mediante `docker compose run --rm supabase-cli <argumentos>`.

## Modos de entorno

### Modo Docker (canónico)

Compose define cinco servicios:

| Servicio       | Propósito                                                    | Puerto                                                |
| -------------- | ------------------------------------------------------------ | ----------------------------------------------------- |
| `dev`          | Servidor de desarrollo de Astro con el código fuente montado | Equipo anfitrión `4321` → contenedor `4321`           |
| `test`         | Ejecución completa de Vitest                                 | Sin puerto publicado; usa la red del equipo anfitrión |
| `build`        | Compilación de producción de Astro                           | Sin puerto publicado                                  |
| `preview`      | nginx sirve el sitio estático generado                       | Equipo anfitrión `4321` → contenedor `80`             |
| `supabase-cli` | Helper opt-in para la CLI local de Supabase                  | Red del equipo anfitrión; sin puerto propio           |

Compose monta el repositorio en `/app` y superpone el volumen con nombre
`app_node_modules` en `/app/node_modules`. El contexto de compilación de Docker
también excluye el `node_modules` del equipo anfitrión mediante `.dockerignore`.
Por lo tanto, las dependencias están aisladas de las instaladas en el equipo
anfitrión; no agregue un montaje bind de `node_modules` del equipo anfitrión a
Compose.

`supabase-cli` es la excepción deliberada: monta el repositorio en la misma ruta
absoluta indicada por `${PWD}` y usa esa ruta como directorio de trabajo. Ejecute
ese servicio únicamente desde la raíz del repositorio. El daemon Docker del host
y la CLI deben resolver la misma ruta; `/app` no cumple ese contrato para los
contenedores que crea Supabase. El perfil `tools` evita que el helper privilegiado
arranque con `docker compose up dev`.

### Alternativa de pnpm en el equipo anfitrión

Use la alternativa del equipo anfitrión solo cuando Docker no esté disponible o
cuando sea necesario un flujo de depuración específico del equipo anfitrión:

```bash
corepack enable
corepack prepare pnpm@10.34.5 --activate
pnpm install --frozen-lockfile
pnpm dev
```

Los flujos del equipo anfitrión y de Docker pueden utilizar el mismo árbol de
código porque Compose mantiene su árbol de dependencias en `app_node_modules`.
Sin embargo, deben utilizar el mismo archivo de bloqueo y no se debe mezclar un
directorio `node_modules` creado por Docker con comandos de pnpm ejecutados en
el equipo anfitrión.

### No mezcle dependencias de Docker con pnpm del equipo local

Si Docker creó anteriormente un árbol de dependencias visible en el equipo
anfitrión o propiedad de root, pnpm del equipo anfitrión puede informar:

```text
ERR_PNPM_UNEXPECTED_STORE
```

El diagnóstico comprobado es que `node_modules` apunta al
`/app/.pnpm-store/v10` de Docker, mientras que pnpm del equipo anfitrión espera
el almacén del equipo anfitrión. No ejecute `sudo pnpm` ni utilice otro gestor de paquetes
para resolver esta incompatibilidad.

Recupere el entorno de forma segura eliminando el directorio de dependencias
generado y reinstalando desde el archivo de bloqueo:

```bash
rm -rf -- node_modules
pnpm install --frozen-lockfile
```

Si la eliminación normal falla porque ese directorio generado pertenece a
root, use `sudo` solo para esa eliminación específica y vuelva después a la
cuenta de usuario normal:

```bash
sudo rm -rf -- node_modules
pnpm install --frozen-lockfile
```

Esto no elimina el volumen con nombre `app_node_modules` de Compose. Para
restablecer deliberadamente ese volumen, detenga el proyecto de Compose con
`docker compose down --volumes`.

## Referencia de comandos

Los comandos de Docker siguientes asumen el flujo canónico. La columna del
equipo anfitrión muestra la alternativa equivalente después de ejecutar
`pnpm install --frozen-lockfile`.

| Tarea                            | Comando con Docker                                                           | Alternativa en el equipo anfitrión                             | Modificación del código fuente                        |
| -------------------------------- | ---------------------------------------------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------- |
| Iniciar el desarrollo            | `docker compose up --build -d dev`                                           | `pnpm dev`                                                     | No                                                    |
| Prueba específica                | `docker compose run --rm --build dev pnpm test -- tests/unit/<file>.test.ts` | `pnpm test -- tests/unit/<file>.test.ts`                       | No                                                    |
| Conjunto completo de pruebas     | `docker compose run --rm --build test`                                       | `pnpm test`                                                    | No                                                    |
| Comprobación de Astro            | `docker compose run --rm --build dev pnpm check`                             | `pnpm check`                                                   | No                                                    |
| Lint                             | `docker compose run --rm --build dev pnpm lint`                              | `pnpm lint`                                                    | No                                                    |
| Comprobación de formato          | `docker compose run --rm --build dev pnpm format:check`                      | `pnpm format:check`                                            | No                                                    |
| Escritura de formato             | `docker compose run --rm --build dev pnpm format`                            | `pnpm format`                                                  | **Sí**; formatea los archivos compatibles en el sitio |
| Compilación                      | `docker compose run --rm --build build`                                      | `pnpm build`                                                   | Escribe la salida generada en `dist/`                 |
| Vista previa de producción       | `docker compose up --build -d preview`                                       | `pnpm build && pnpm preview`                                   | La compilación escribe `dist/`                        |
| Reconstruir imágenes             | `docker compose build`                                                       | No aplicable                                                   | Solo estado de Docker                                 |
| Reconstruir y recrear `dev`      | `docker compose up --build -d --force-recreate dev`                          | No aplicable                                                   | Solo estado de Docker                                 |
| Estado de los servicios          | `docker compose ps`                                                          | No aplicable                                                   | No                                                    |
| Registros de desarrollo          | `docker compose logs -f dev`                                                 | No aplicable                                                   | No                                                    |
| Detener servicios                | `docker compose down`                                                        | Detener el proceso del equipo anfitrión con `Ctrl+C`           | Solo estado de Docker                                 |
| Eliminar volumen de dependencias | `docker compose down --volumes`                                              | Eliminar `node_modules` solo al restablecerlo intencionalmente | Estado de Docker/dependencias                         |
| Ejecutar la CLI de Supabase      | `docker compose run --rm supabase-cli <argumentos>`                          | No recomendada para el flujo canónico                          | Estado local según el subcomando                      |

Los scripts del paquete están definidos en `package.json`:

```text
dev          astro dev
build        astro build
preview      astro preview
check        pnpm dlx @astrojs/check@0.9.10 check
lint         eslint .
format:check prettier --check .
format       prettier --write .
```

Use `format:check` para la validación. Use `format` solo cuando tenga la
intención de modificar archivos. Para dar formato a este README sin tocar otros
archivos:

```bash
docker compose run --rm --build dev pnpm exec prettier --write README.md
```

Detenga el servicio `dev` antes de iniciar `preview`, porque ambos publican el
puerto del equipo anfitrión `4321`.

## Puerta de calidad antes de un commit

Ejecute la prueba específica relevante para el cambio y, después, las
comprobaciones completas que correspondan al trabajo:

```bash
# Use un archivo de pruebas específico cuando el cambio sea acotado.
docker compose run --rm --build dev pnpm test -- tests/unit/<file>.test.ts

# Pruebas completas y comprobaciones de calidad estáticas.
docker compose run --rm --build test
docker compose run --rm --build dev pnpm check
docker compose run --rm --build dev pnpm lint
docker compose run --rm --build dev pnpm format:check
docker compose run --rm --build build

# Confirme que comprende el estado del árbol de trabajo y los espacios en blanco.
git diff --check
git status --short
```

Para los cambios visibles para el usuario, verifique el sitio en ejecución con
el flujo de Playwright que se describe a continuación y compruebe las rutas
correspondientes, incluidas `/` y `/blog`. Confirme que el estado final solo
contenga cambios intencionales y que no haya artefactos de navegador generados
ni credenciales.

Este repositorio no habilita actualmente el desarrollo guiado por recibos.
Registre los comandos y resultados reales en el contexto del cambio o de la
revisión, en lugar de afirmar que se ejecutó un sistema de recibos.

## CLI de Playwright

La convención del navegador local del proyecto está definida por
`.playwright/cli.config.json`, que selecciona Chromium. La CLI de Playwright
está disponible globalmente en el entorno del mantenedor, pero no está
instalada por el `package.json` de este repositorio.

### Instalar o verificar

Si el comando global no está disponible, compruebe primero si ya existe un
binario local de Playwright:

```bash
npx --no-install playwright --version
```

Si eso no resuelve una instalación local, instale la CLI globalmente como se
describe en la guía específica del proyecto y luego verifíquela:

```bash
npm install -g @playwright/cli@latest
playwright-cli --version
```

No agregue Playwright a `package.json` solo para utilizar este flujo de trabajo
de la CLI.

### Verificar el sitio en ejecución

Inicie primero el servicio de desarrollo de Docker y luego utilice una sesión
con nombre y la configuración del proyecto:

```bash
docker compose up --build -d dev

playwright-cli -s=teamjobs-local open http://localhost:4321 --config=.playwright/cli.config.json
playwright-cli -s=teamjobs-local snapshot
playwright-cli -s=teamjobs-local goto http://localhost:4321/blog
playwright-cli -s=teamjobs-local snapshot
playwright-cli -s=teamjobs-local close
rm -rf -- .playwright-cli
```

Use `playwright-cli -s=teamjobs-local list` si necesita inspeccionar las
sesiones. Cierre las sesiones con nombre cuando termine. Las instantáneas,
capturas de pantalla, trazas, videos y otros archivos generados en
`.playwright-cli/` son artefactos locales de verificación y no deben confirmarse.
Elimine el directorio antes de revisar el `git status`.

## Supabase

### Flujo de trabajo con el proyecto alojado

Los datos del proyecto alojado son los siguientes:

- Proyecto: `teamjobs-landing`.
- Organización: `Landing TeamJobs`.
- Región: `us-east-1`.
- CLI local: dependencia de desarrollo exacta del proyecto `supabase@2.111.0`.
- Configuración versionada: `supabase/config.toml`.

La referencia del proyecto alojado se representa intencionalmente como
`<project-ref>` en este documento. Obténgala con el comando
`docker compose run --rm supabase-cli projects list`, desde el panel de Supabase o mediante un
mantenedor autorizado.

El flujo de trabajo con el proyecto alojado de Supabase consiste en iniciar
sesión, listar y vincular:

```bash
docker compose run --rm supabase-cli --version
docker compose run --rm supabase-cli login
docker compose run --rm supabase-cli projects list
docker compose run --rm supabase-cli link --project-ref <project-ref>
```

`supabase login` abre el flujo de autenticación. `supabase link` puede requerir
la contraseña de la base de datos remota. Obténgala o restablézcala de forma
segura mediante un mantenedor autorizado, el gestor de contraseñas del equipo o
el panel de Supabase. Nunca la incluya en este README, en el historial de la
terminal, en el chat, en un archivo confirmado ni en un cliente público. No utilice
una clave de tipo `service-role key` en el código del navegador.

Los metadatos del vínculo local se almacenan en archivos ignorados dentro de
`supabase/.temp/`. La copia de trabajo del mantenedor tiene actualmente
metadatos vinculados, pero este estado es local a esa copia y no está confirmado.
Cada desarrollador debe autenticarse y establecer sus propios metadatos de
vínculo; no copie `.temp` entre máquinas.

La aplicación incluye un cliente de navegador basado en
`@supabase/supabase-js`, que lee únicamente `PUBLIC_SUPABASE_URL` y
`PUBLIC_SUPABASE_PUBLISHABLE_KEY`. La autenticación, el editor, la
administración y el blog están implementados. La CLI de Supabase se ejecuta
mediante el helper contenedorizado documentado arriba. Consulte
[`documentation/autenticacion-permisos.md`](documentation/autenticacion-permisos.md)
para conocer el flujo y los permisos en detalle.

### Pila local opcional de Supabase

La pila local de Supabase es opcional y está separada tanto del proyecto alojado
como de los servicios Compose de Astro. Requiere Docker:

```bash
docker compose run --rm supabase-cli start
docker compose run --rm supabase-cli status -o env
docker compose run --rm supabase-cli db reset
docker compose run --rm supabase-cli stop
```

Los puertos provienen de `supabase/config.toml`:

| Servicio local                       | Dirección/puerto         |
| ------------------------------------ | ------------------------ |
| API de Supabase                      | `http://127.0.0.1:54321` |
| Base de datos Postgres               | `127.0.0.1:54322`        |
| Supabase Studio                      | `http://127.0.0.1:54323` |
| Interfaz local de correo             | `http://127.0.0.1:54324` |
| Puerto de sombra de la base de datos | `127.0.0.1:54320`        |

`supabase start` crea contenedores y datos locales; no inicia Astro.
`docker compose down` administra el proyecto de Compose de Astro, no esta pila
local de Supabase. El comando normal `docker compose run --rm supabase-cli stop` conserva los
datos locales mediante el flujo de copia de seguridad de la CLI. No utilice
`docker compose run --rm supabase-cli stop --no-backup` ni `--all` de forma casual:
`--no-backup` elimina los volúmenes de datos locales y `--all` detiene todas las
instancias locales de Supabase del usuario.
Considere confidencial la salida de `supabase status` si contiene claves o
credenciales locales; no la pegue en el chat ni en registros confirmados.

Antes de implementar trabajo de base de datos, recuerde:

- Las tablas nuevas no se exponen necesariamente a través de la Data API de
  forma automática. Utilice permisos explícitos cuando se pretenda exponerlas.
- Habilite y revise Row Level Security (RLS) para cada tabla de un esquema
  expuesto. Los permisos controlan si se puede acceder a una tabla; RLS
  controla qué filas son visibles.
- Utilice migraciones y una revisión de seguridad para los cambios de esquema.
  No realice ediciones directas del esquema como sustituto de una migración
  confirmada.

La configuración actual de Auth en `supabase/config.toml` todavía utiliza el
puerto `3000` para las URL generadas y las redirecciones permitidas (`site_url`
es `http://127.0.0.1:3000`; la entrada de redirección adicional es
`https://127.0.0.1:3000`). Astro se ejecuta en `http://localhost:4321`;
actualice la configuración de Auth como parte de la futura integración de
autenticación antes de depender de las URL de devolución de llamada. No se
requiere configurar Auth para el sitio estático actual.

## Estructura del proyecto

| Ruta                          | Propósito                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `src/pages/`                  | Rutas de Astro: `/`, `/blog`, `/privacidad` y `/cookies`.                                                                      |
| `src/components/`             | Secciones estáticas de las páginas Astro, navegación, pie de página, interfaz del blog y marcadores de posición.               |
| `src/islands/`                | Islas de Preact y validación del cliente, incluida la navegación móvil y la interfaz de contacto.                              |
| `src/layouts/`                | Diseños compartidos de Astro y estructura de los documentos.                                                                   |
| `src/content/`, `src/config/` | Contenido del sitio y configuración de la aplicación.                                                                          |
| `src/styles/`                 | Punto de entrada global de Tailwind/CSS.                                                                                       |
| `public/`, `src/assets/`      | Recursos multimedia públicos y recursos importados.                                                                            |
| `tests/unit/`                 | Pruebas unitarias de Vitest para rutas, componentes, navegación, diseño y comportamiento de validación.                        |
| `docs/phases/`                | Documentación de implementación por fase.                                                                                      |
| `mockups/`                    | Referencias de diseño; excluidas del contexto de compilación de Docker.                                                        |
| `supabase/`                   | Configuración de la CLI de Supabase y trabajo futuro de base de datos/autenticación. `.temp/` son metadatos locales ignorados. |
| `Dockerfile`                  | Etapas fijadas de compilación de Node.js/pnpm e imagen de producción de nginx.                                                 |
| `docker-compose.yml`          | Orquestación de Astro y helper opt-in `supabase-cli`, con socket y ruta absoluta compartida.                                   |
| `nginx.conf`                  | Configuración del servidor de producción estático.                                                                             |
| `.agents/skills/`             | Guías locales del proyecto para la CLI de Playwright, Supabase y las prácticas recomendadas de Supabase Postgres.              |
| `.playwright/cli.config.json` | Configuración del navegador para la CLI de Playwright.                                                                         |

## Rutas, objetivos excluidos y trabajo aplazado

Las rutas actuales son:

- `/` — Página de aterrizaje principal de TeamJobs.
- `/blog` — Interfaz de blog estática.
- `/privacidad` — Página de privacidad.
- `/cookies` — Página de cookies.

Objetivos actuales excluidos y trabajo aplazado conocido:

- El contenido del blog es estático; no existe integración con un CMS.
- La búsqueda y el comportamiento de navegación aplazada se representan
  mediante los marcadores de posición actuales de la interfaz; no tienen el
  respaldo de un servicio de búsqueda.
- No existe una base de datos activa, un flujo de Auth, una integración con
  Storage ni una integración con el SDK cliente de Supabase.
- La creación del proyecto de Supabase, la instalación de la CLI, la
  configuración y el vínculo local no significan que la integración con la
  aplicación esté completa.

## Solución de problemas

### El puerto `4321` ya está en uso

Los servicios `dev` y `preview` publican el puerto `4321` del equipo anfitrión.
Compruebe el estado de Compose, detenga los contenedores obsoletos del proyecto
y vuelva a intentarlo:

```bash
docker compose ps
docker compose down
docker compose up --build -d dev
```

Si otra aplicación utiliza el puerto, detenga esa aplicación o realice un
cambio deliberado del puerto de Astro solo en el equipo anfitrión. No ejecute
`dev` y `preview` al mismo tiempo en el puerto predeterminado.

### El contenedor `dev` utiliza una imagen obsoleta

Reconstruya la imagen de `dev` y fuerce su recreación cuando hayan cambiado el
Dockerfile, el archivo de bloqueo o la instalación de dependencias:

```bash
docker compose build dev
docker compose up -d --force-recreate dev
docker compose ps dev
docker compose logs -f dev
```

Utilice `docker compose build --no-cache dev` solo cuando una reconstrucción
normal no resuelva un problema relacionado con la caché.

### Docker informa de una advertencia de Buildx/constructor clásico

Una advertencia sobre el constructor clásico o Buildx es una advertencia del
equipo anfitrión de Docker o de las herramientas de compilación, no constituye
por sí sola un fallo de Astro o pnpm. Compruebe el código de salida del comando y el error final
de compilación antes de cambiar archivos de la aplicación. Mantenga Docker
Engine/Desktop y Compose v2 actualizados según la política del equipo; no
agregue configuración de Docker no relacionada para silenciar una advertencia.

### pnpm informa de un almacén inesperado o de propiedad de root

Consulte [No mezcle dependencias de Docker con pnpm del equipo local](#no-mezcle-dependencias-de-docker-con-pnpm-del-equipo-local).
Elimine solo el directorio `node_modules` generado, utilice `sudo rm` de forma
específica únicamente cuando su propiedad lo requiera y reinstale con la
versión fijada de pnpm. Nunca ejecute el gestor de paquetes como root.

### Astro/Vite del equipo anfitrión no encuentra un módulo nativo opcional de Rollup

Los errores como la ausencia del módulo nativo opcional
`@rollup/rollup-*-gnu` suelen indicar un árbol de dependencias del equipo
anfitrión creado para otra plataforma o almacén. Prefiera el flujo de Docker.
Para una reparación exclusiva del equipo anfitrión, elimine y reinstale el
árbol de dependencias mediante el archivo de bloqueo:

```bash
rm -rf -- node_modules
pnpm install --frozen-lockfile
```

Aplique la excepción para directorios propiedad de root indicada anteriormente
solo si la eliminación normal falla. No instale manualmente un paquete de
Rollup aleatorio y específico de la plataforma.

### Falla el inicio de sesión o el vínculo de Supabase

Ejecute la CLI local del proyecto y compruebe la autenticación y la visibilidad
del proyecto:

```bash
docker compose run --rm supabase-cli --version
docker compose run --rm supabase-cli login
docker compose run --rm supabase-cli projects list
docker compose run --rm supabase-cli link --project-ref <project-ref>
```

Confirme que la cuenta tiene acceso a `Landing TeamJobs` y al proyecto
`teamjobs-landing`. Si el vínculo solicita la contraseña de la base de datos,
obténgala o restablézcala mediante un canal seguro autorizado. No sustituya la
CLI global de Supabase, copie el `supabase/.temp/` de otro desarrollador ni
confirme credenciales locales.

### Aparecen instantáneas del navegador u otros artefactos generados en el estado de Git

Cierre la sesión de Playwright con nombre y elimine el directorio generado:

```bash
playwright-cli -s=teamjobs-local close
rm -rf -- .playwright-cli
```

No confirme instantáneas, capturas de pantalla, trazas, videos, cookies, estado
del almacenamiento ni credenciales.

## Flujo de contribución

1. Cree una rama enfocada a partir de la rama main actual.
2. Mantenga cada cambio como una unidad de trabajo revisable. Incluya las
   pruebas y la documentación junto con el comportamiento que explican.
3. Utilice la puerta de calidad antes de solicitar la revisión.
4. Utilice mensajes de Conventional Commits, por ejemplo
   `docs(onboarding): document local development workflow`.
5. No agregue atribución de IA ni líneas finales `Co-Authored-By`.
6. Nunca confirme secretos, archivos `.env*`, `supabase/.temp/`, estado del
   navegador ni artefactos de Playwright generados.
7. No edite directamente el esquema alojado. Utilice el flujo de migraciones
   del repositorio y solicite una revisión de base de datos y seguridad para
   cambios de esquema, permisos, RLS, Auth, Storage o datos de usuarios.
8. Escriba la documentación del proyecto en español, salvo que el mantenedor
   solicite explícitamente otro idioma.

Para un cambio que solo afecte a la documentación, el límite de reversión es el
archivo de documentación afectado. Para los cambios de comportamiento,
mantenga la implementación, las pruebas y la documentación en la misma unidad
de trabajo revisable siempre que sea práctico.

## Referencias oficiales

- [Guía de inicio de Astro](https://docs.astro.build/en/getting-started/)
- [Desarrollo y compilación con Astro](https://docs.astro.build/en/develop-and-build/)
- [Documentación de pnpm](https://pnpm.io/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Guía de inicio de la CLI de Supabase](https://supabase.com/docs/guides/local-development/cli/getting-started)
- [Referencia de la CLI de Supabase](https://supabase.com/docs/reference/cli/introduction)
- [Referencia de configuración local de Supabase](https://supabase.com/docs/guides/local-development/cli/config)
- [Documentación de Auth de Supabase](https://supabase.com/docs/guides/auth)
- [Seguridad de la Data API de Supabase](https://supabase.com/docs/guides/api/securing-your-api)
- [Seguridad a nivel de fila de Supabase (RLS)](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [CLI de Playwright](https://github.com/microsoft/playwright-cli)
