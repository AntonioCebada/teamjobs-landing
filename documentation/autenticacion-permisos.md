# Registro, inicio de sesión y sesiones

TeamJobs ofrece registro e inicio de sesión con Supabase. El navegador recibe
únicamente la URL pública y una clave `publishable`; nunca una clave secreta o
`service_role`.

## Ruta disponible

| Ruta       | Propósito                                | Acceso        |
| ---------- | ---------------------------------------- | ------------- |
| `/auth/`   | Registro, inicio y cierre de sesión      | Público       |
| `/editor/` | Creación y edición de borradores propios | Editor activo |
| `/admin/`  | Gestión de cuentas y publicaciones       | Admin activo  |

El navbar de escritorio y el menú móvil muestran **Iniciar sesión** con destino
a `/auth/`. El footer no incluye este acceso.

## Prerrequisitos

- Docker y Docker Compose disponibles.
- Dependencias instalables desde el lockfile con pnpm `10.34.5`.
- Supabase CLI `2.111.0`, provista por las dependencias del proyecto.
- La migración local de perfiles y roles aplicada.
- Los puertos de Supabase local y `4321` disponibles.

No ejecute estos pasos contra un proyecto alojado sin una aprobación operativa
independiente.

## Registro e inicio de sesión

1. Abra `/auth/` y elija **Crear una cuenta**.
2. Ingrese nombre público, correo y contraseña.
3. La cuenta se crea siempre como **Lector**. El formulario no permite elegir ni modificar roles.
4. Si el entorno exige confirmación de correo, complétela antes de iniciar sesión.
5. La sesión se conserva en `localStorage` y se elimina mediante **Cerrar sesión**.

Los lectores no pueden elevar su propio rol. La autorización permanece en la
base de datos y no depende de controles visuales del navegador.

## Editor de borradores

Una cuenta con rol Editor puede abrir `/editor/`, crear borradores y modificar
únicamente los borradores que le pertenecen. La interfaz no ofrece acciones de
publicación o archivo. Una cuenta lectora, suspendida o anónima recibe una
denegación explícita, mientras que RLS conserva la autoridad final sobre cada
lectura y escritura.

## Administración

Una cuenta administradora activa puede abrir `/admin/`, cambiar roles, suspender
o reactivar cuentas, editar publicaciones y cambiar su estado a publicado o
archivado. La base de datos valida cada operación y protege al último
administrador activo.

El primer administrador no se crea desde el navegador. Su promoción requiere
una acción fuera de banda, aprobada y ejecutada por una persona mantenedora que
verifique previamente la identidad y el entorno. No utilice una clave
`service_role` en el frontend para realizar este bootstrap.

## Configuración local

Inicie Supabase local y obtenga sus variables públicas:

```sh
docker compose run --rm supabase-cli start
docker compose run --rm supabase-cli status -o env
```

Copie únicamente `API_URL` y `PUBLISHABLE_KEY` al archivo local ignorado `.env`:

```dotenv
PUBLIC_SUPABASE_URL=<valor-local-de-API_URL>
PUBLIC_SUPABASE_PUBLISHABLE_KEY=<valor-local-de-PUBLISHABLE_KEY>
```

Después ejecute:

```sh
docker compose up --build dev
```

El comando de desarrollo falla de inmediato cuando falta una variable pública.
El archivo `.env` permanece ignorado y fuera del contexto de build;
`.env.example` contiene únicamente valores de ejemplo.

En desarrollo local, la URL suele ser `http://127.0.0.1:54321`. Debe ser
alcanzable desde el navegador, no solo desde el contenedor. En una VM o un
navegador remoto, configure una URL HTTP(S) que ese navegador pueda resolver.

## Resolución de problemas

| Síntoma                                      | Comprobación                                                                                    |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Docker dev informa una variable faltante     | Obtenga de nuevo `API_URL` y `PUBLISHABLE_KEY` y configure solo los nombres `PUBLIC_*`.         |
| `/auth/` muestra un error genérico           | Confirme que Supabase está activo, la URL es absoluta y la clave empieza con `sb_publishable_`. |
| El navegador recibe `ERR_CONNECTION_REFUSED` | Compruebe la URL desde el mismo navegador y revise la frontera entre host, VM y contenedor.     |
| La cuenta creada no inicia sesión            | Verifique si el entorno exige confirmación de correo.                                           |

Nunca solucione un error agregando una clave `service_role` o secreta al
frontend. Revise la configuración pública, la sesión, el perfil y las políticas
de la base de datos.

## Rollback

El acceso de cuenta se revierte retirando la ruta `/auth/`, sus islas y el
bloque de contenido `account`. La configuración del cliente público y la
migración permanecen disponibles para futuras unidades de la cadena.
