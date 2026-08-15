# Informe de archivo: auth-rbac-blog-authoring

**Cambio**: `auth-rbac-blog-authoring`
**Fecha de archivo**: 2026-08-12
**Ruta de archivo**: `openspec/changes/archive/2026-08-12-auth-rbac-blog-authoring/`
**Modo de persistencia**: híbrido — OpenSpec autoritativo en sistema de archivos y espejo del informe en Engram (tema `sdd/auth-rbac-blog-authoring/archive-report`)
**Estado estructurado previo al lanzamiento**: `artifactStore: openspec`; 21/21 tareas completas; `dependencies.archive: ready`; `nextRecommended: archive`; `blockedReasons: []`; `actionContext.mode: repo-local`; `allowedEditRoots: <repository-root>`.

## Estado final (autoridad de estado final)

El ciclo se cierra con los siguientes hechos de estado FINAL, según la jerarquía de autoridad (autoridad de revisión nativa → artefacto de tareas persistido → hechos explícitos de estado final del lanzador → instantáneas intermedias):

1. **Verificación final independiente en verde**: 21/21 tareas, 7/7 requisitos, 15/15 escenarios, pgTAP 42/42, Vitest 59/59, Playwright 6/6; runtime dev Docker corregido con `/` y `/blog/` en HTTP 200 sin `CssSyntaxError`; check/lint/format/build/nginx/runtime/diff-check en verde.
2. **Informe de verificación vigente**: `openspec/changes/auth-rbac-blog-authoring/verify-report.md` (ahora archivado), veredicto **PASS**, `critical_findings: 0`, `blockers: 0`; SHA-256 del informe `fd00054279e15708164a6ebf21d4d117eea1f8e42de6c24f7ac395af64284e98`; revisión de evidencia `sha256:506ca49acf111b340f34abc58e9a3b58ce7babd2382c6bafa09c584dc17fef62`.
3. **Intento de verificación refrescado**: liquidado `complete/passed`; revisión final nativa `sha256:625c4de22f395928d40b42ff306481cc0b025e14c43e792b7f51392b98b7be4e`.
4. **Intento de aplicación focalizado posterior a la verificación**: liquidado `complete/passed` con revisión de evidencia `sha256:93cbd42bc37930f0bbbe6c9fe33d0bcf93c1a4e0fa37ebb71fcc893d61f375c8`.
5. **Defecto PostCSS corregido**: la variante arbitraria de Tailwind `[&::-webkit-details-marker]:hidden` generaba `&amp` en el CSS generado por el dev de Astro/Vite; se reemplazó por la clase nombrada `summary-marker-hidden` más una regla CSS equivalente en `src/styles/global.css`. La corrección está en `src/islands/MobileNav.tsx:100`, `src/styles/global.css:89` y cubierta por `tests/unit/navigation.test.ts:66,72` (verificado en el repositorio durante el archivo).
6. **Advertencia de aprobación documental**: corregida. El diseño, el rollout y el progreso registran la aprobación del mantenedor del proyecto de los textos legales en español el 12 de agosto de 2026; la revisión legal externa permanece opcional/futura y no se afirma como completada.

### Resolución de discrepancias entre fuentes

- La observación intermedia de Engram #310 (2026-08-11 19:32) registró "PASS WITH WARNINGS" por el defecto CSS y la advertencia de aprobación. Ambos hallazgos fueron corregidos con posterioridad (hechos 5 y 6) y el informe de verificación vigente es **PASS** sin warnings. Conforme a la jerarquía, se reporta el estado final (PASS) y las correcciones posteriores; la afirmación intermedia queda como historia válida en el momento de su escritura, no como estado actual.
- El fallo transitorio del mirror de Alpine (`ca-certificates (no such package)`) en una repetición del harness quedó registrado en `verify-report.md` como inestabilidad externa no reproducida; la ejecución posterior, sin cambios de código, aprobó 6/6. No es un defecto funcional y no se funde en una narrativa causal única con otros hallazgos.
- No existen contradicciones sin clasificar entre fuentes de distinta autoridad.

## Puertas de validación

| Puerta | Resultado | Evidencia |
|---|---|---|
| Completitud de tareas (Task Completion Gate) | ✅ PASA | `tasks.md` persistido con 21/21 casillas `[x]` y 0 pendientes; estado nativo `taskProgress.allComplete: true` |
| Puerta de recibo de revisión nativa (Native Review Receipt Gate) | ✅ PASA — `reviewGate` estructuralmente AUSENTE | El estado nativo no contiene la clave `reviewGate`; solo aparece `reviewOffer` (invitación, nunca una puerta). No se descubrió ninguna revisión para este candidato; se procede bajo la política ordinaria del repositorio y NO se lanza revisión |
| Hallazgos CRITICAL de verificación | ✅ NINGUNO | `verify-report.md`: `critical_findings: 0`, `blockers: 0`, veredicto PASS |
| Guarda de contexto de edición (Action Context Guard) | ✅ PASA | `actionContext.mode: repo-local`; todas las operaciones dentro de `allowedEditRoots` |

## Sincronización de especificaciones delta → especificaciones principales

`openspec/specs/` no existía antes de este archivo; las cuatro especificaciones delta son por tanto especificaciones COMPLETAS de nuevos dominios. Se copiaron mecánicamente (nunca vía lectura→escritura del modelo) con el patrón `cp` a archivo temporal → `diff -r` (readback obligatorio) → `mv`.

| Dominio | Acción | Requisitos creados | Escenarios |
|---|---|---|---|
| `account-access-rbac` | Creado | 2 (Reader Account Signup and Session; Administrative Role and Suspension Control) | 5 |
| `account-privacy-disclosure` | Creado | 1 (Truthful Account and Session Notice) | 2 |
| `blog-editorial-authoring` | Creado | 2 (Editor Draft Ownership; Administrative Editorial Control) | 4 |
| `public-blog-publication` | Creado | 2 (Published Content Visibility; Safe Public Author Rendering) | 4 |

Total: 7 requisitos, 15 escenarios — coherente con el informe de verificación (7/7, 15/15). No hubo requisitos `MODIFIED`, `REMOVED` ni `RENAMED`; no se perdió ningún requisito no mencionado en el delta (no existían especificaciones principales previas). No aplica la advertencia de deltas destructivos de `rules.archive`.

## Contenido del archivo

`openspec/changes/archive/2026-08-12-auth-rbac-blog-authoring/` contiene:

- `proposal.md` ✅
- `exploration.md` ✅
- `design.md` ✅
- `specs/` ✅ (4 dominios: `account-access-rbac`, `account-privacy-disclosure`, `blog-editorial-authoring`, `public-blog-publication`)
- `tasks.md` ✅ (21/21 tareas completas, 0 sin marcar)
- `apply-progress.md` ✅
- `verify-report.md` ✅
- `archive-report.md` ✅ (este documento; aditivo, excluido del readback)

La carpeta de cambios activos ya no contiene `auth-rbac-blog-authoring`; solo permanecen `archive/` e `initial-teamjobs-landing`.

## Comandos mecánicos y readbacks `diff -r` (solo salida vacía pasa)

**Paso 2 — sincronización de especificaciones** (por cada dominio: `cp` → `diff -r` → `mv`):

```
=== DOMAIN: account-access-rbac ===
--- diff -r source-vs-temp (MANDATORY readback) ---
--- diff exit 0 (only empty output passes) ---
=== DOMAIN: account-privacy-disclosure ===
--- diff -r source-vs-temp (MANDATORY readback) ---
--- diff exit 0 (only empty output passes) ---
=== DOMAIN: blog-editorial-authoring ===
--- diff -r source-vs-temp (MANDATORY readback) ---
--- diff exit 0 (only empty output passes) ---
=== DOMAIN: public-blog-publication ===
--- diff -r source-vs-temp (MANDATORY readback) ---
--- diff exit 0 (only empty output passes) ---
```

**Paso 3 — movimiento a archivo** (instantánea recursiva previa → `git mv` → fallback `mv` → ausencia de origen → `diff -r`):

```
fatal: directorio de fuente está vacío, fuente=openspec/changes/auth-rbac-blog-authoring, destino=openspec/changes/archive/2026-08-12-auth-rbac-blog-authoring
git mv failed (expected for untracked folder); fallback: mv
source absence: confirmed (no path, no symlink)
--- diff -r snapshot-vs-archive (MANDATORY readback) ---
--- diff exit 0 (only empty output passes) ---
```

`git mv` falló por ser la carpeta no rastreada (esperado) y se usó `mv`. Todos los readbacks `diff -r` devolvieron salida VACÍA (identidad de bytes íntegra); la carpeta archivada coincide byte a byte con la instantánea previa al movimiento. Los permisos de los `spec.md` principales se restauraron a 0644 para igualar el modo de origen tras el patrón de archivo temporal.

**Readback adicional de paridad**: los cuatro `openspec/specs/{dominio}/spec.md` son idénticos a los deltas archivados (4/4, `diff -r` vacío).

## IDs de observación de Engram

Artefactos autoritativos leídos en el sistema de archivos (OpenSpec). IDs de Engram identificados para trazabilidad (espejos y registros de fases):

- #305 — `sdd/auth-rbac-blog-authoring/verify-report` (espejo leído completo; contenido idéntico al `verify-report.md` autoritativo del sistema de archivos; sesión `sdd-verify-auth-rbac-blog-authoring-20260811`)
- #282 — artefacto de diseño (`design.md`)
- #286, #293, #296 — implementación de unidades 1, 2 y 3
- #302 — finalización de la tarea 5.1 (aprobación del mantenedor)
- #310 — verificación intermedia (instantánea; superada por el estado final, ver resolución de discrepancias)
- #311 — corrección de la advertencia de aprobación documental
- #314 — hallazgo de evidencia de autoridad de aplicación no liquidada
- #316 — corrección del registro de liquidación nativa CSS

No existen en Engram temas espejo de propuesta/especificaciones/tareas para este cambio (búsquedas `sdd/auth-rbac-blog-authoring/{proposal,spec,tasks}` sin resultados); la autoridad para esos artefactos es el sistema de archivos.

## Riesgos y pendientes no bloqueantes

- **Ninguno bloqueante**. Restos no bloqueantes, declarados con honestidad:
  1. Dos hints preexistentes de Astro en `About.astro` (0 errores, 0 warnings; no introducidos por este cambio).
  2. Dependencia transitoria del mirror de Alpine en el harness de navegador (`apk add docker-cli`); una repetición falló por red y la ejecución posterior aprobó 6/6. Sugerencia registrada en `verify-report.md`: preparar una imagen de prueba previa.
- Pendiente operativo intencional (fuera del alcance de este cambio y del archivo): identidad del administrador inicial y valores públicos de build `PUBLIC_*` para producción; revisión legal externa opcional/futura.

## Veredicto

Archivo COMPLETO e intencional (sin advertencias de archivo parcial). El cambio `auth-rbac-blog-authoring` queda planificado, implementado, verificado y archivado; el ciclo SDD se cierra. No se alteró implementación fuente, pruebas, commits, remotes ni se lanzó revisión; no se crearon commits/pushes/PR.
