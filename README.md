# TeamJobs Landing

## Tecnologías

| Área | Tecnología y función |
| --- | --- |
| Frontend y generación estática | Astro 5 genera el sitio estático; TypeScript con configuración estricta aporta tipado al código. |
| Islas interactivas | Preact 10, integrado con Astro, hidrata la navegación móvil; también implementa una isla opcional para el video principal, actualmente desactivada. |
| Estilos y recursos | Tailwind CSS 4 se integra mediante Vite; Fontsource proporciona la fuente Poppins y Sharp respalda el procesamiento de imágenes de Astro. |
| Pruebas y calidad | Vitest 4 ejecuta las pruebas unitarias; Astro Check, ESLint y Prettier cubren validación, análisis estático y formato. |
| Entorno y publicación | Docker Compose coordina desarrollo, construcción y pruebas en contenedores con Node.js 22 y pnpm 10; la imagen de producción sirve la salida estática mediante nginx 1. |

## Requisitos previos

- Docker Engine con Docker Compose v2 (`docker compose`)

La imagen de Docker incluye Node.js y pnpm, por lo que no es necesario instalarlos en el equipo anfitrión.

## Desarrollo

Inicie el servidor de desarrollo de Astro:

```bash
docker compose up --build dev
```

Abra [http://localhost:4321](http://localhost:4321) en el navegador.

Detenga el servidor con `Ctrl+C` y elimine los contenedores y la red:

```bash
docker compose down
```

Para eliminar también el volumen de dependencias administrado por Compose:

```bash
docker compose down --volumes
```

## Vista previa de producción

Construya el sitio estático y sírvalo con la imagen de producción configurada con nginx:

```bash
docker compose up --build preview
```

Abra [http://localhost:4321](http://localhost:4321) en el navegador. Para detener y limpiar el entorno, utilice los mismos comandos indicados anteriormente.
