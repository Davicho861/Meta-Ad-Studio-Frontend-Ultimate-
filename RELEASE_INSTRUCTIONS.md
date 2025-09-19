# Instrucciones de Lanzamiento - Meta Ad Studio v1.1.0

Este documento resume los pasos operativos para transformar el Release Candidate en un producto en vivo.

## Pre-requisitos
- Tienes acceso con permisos de maintainer al repositorio GitHub.
- Tienes acceso al proyecto en Vercel y permisos para configurar dominios y variables de entorno.
- Tienes acceso a Sentry y a las credenciales (DSN, Auth Token) necesarias.
- El ZIP `meta-ad-studio-release-v1.1.zip` existe en la raíz del repositorio (ya creado).

## 1) Crear PR final (si es necesario)
Plantilla de título: `chore(release): Prepare for v1.1 launch`
Plantilla de cuerpo (PR):

- Resumen: Preparación para lanzamiento v1.1.0. Contiene cambios de limpieza, tipado y arreglos de estabilidad.
- Checklist:
  - [ ] Lint pasado
  - [ ] Tests unitarios verdes
  - [ ] E2E verdes
  - [ ] Build (vite) completado
  - [ ] `meta-ad-studio-release-v1.1.zip` adjuntado a la release

Instrucciones breve:
1. Crea el PR desde la rama de estabilización a `main`.
2. Espera a que CI (lint/test/build) pase.
3. Fusiona (Merge) usando "Squash and merge" o la estrategia de tu equipo.

## 2) Tag y Release en GitHub
Comandos locales (ejecutar desde la raíz del repo):

```bash
# Asegúrate de estar en main, limpio y actualizado
git checkout main
git pull origin main

# Crear tag local
git tag -a v1.1.0 -m "Release v1.1.0: Production-ready build with full test coverage and linting."

# Empujar tag al remoto
git push origin v1.1.0
```

Subir Release y adjuntar ZIP (manual):
1. Ve a GitHub > Releases > Draft a new release
2. Selecciona tag `v1.1.0` (o crea uno desde UI)
3. Título: `Release v1.1.0`
4. Cuerpo: copiar desde `RELEASE_ANNOUNCEMENT.md` o `RELEASE_NOTES.md` y añadir notas operativas.
5. Adjunta `meta-ad-studio-release-v1.1.zip` como asset.
6. Publica "Release".

Opcional (gh CLI):
```bash
# Requiere gh autenticado
gh release create v1.1.0 meta-ad-studio-release-v1.1.zip --title "Release v1.1.0" --notes-file RELEASE_ANNOUNCEMENT.md
```

## 3) Despliegue en Vercel
1. Conecta el repo a Vercel (si no está conectado). Si ya está conectado, Vercel desplegará automáticamente al detectar un push a `main`.
2. Forzar Deploy desde la interfaz: Projects > [tu proyecto] > Deployments > Trigger Deployment (o re-deploy latest).
3. Dominios: Configura dominio de producción (ej. `www.metaadstudio.io`) en Settings > Domains. Añade los registros DNS que Vercel indique.
4. Variables de entorno: añade las siguientes variables en Settings > Environment Variables (Production):
   - SENTRY_DSN (valor desde Sentry)
   - SENTRY_AUTH_TOKEN (si usas integraciones)
   - NODE_ENV=production

## 4) Observabilidad - Sentry
- En Sentry, crea/provisiona el proyecto `meta-ad-studio`.
- Copia el DSN y configúralo en Vercel como `SENTRY_DSN`.
- Opcional: configurar release monitoring en Sentry con el tag `v1.1.0`.

## 5) Checklist post-despliegue (validación rápida)
- [ ] URL pública accesible (Vercel URL o dominio propio)
- [ ] Página principal carga sin errores JS en consola
- [ ] Sentry recibiendo eventos (puedes generar error de prueba)
- [ ] Monitoreo de rendimiento básico activo
- [ ] Canary test: crear 3 usuarios de prueba y completar flujo principal

## 6) Comunicación y Early Adopters
- Crea canal Discord/Slack y añade un mensaje de bienvenida y feedback template.
- Envía invitaciones a early adopters con instrucciones y agradecimiento.

## Plantilla de anuncio (para publicar)
Título: Meta Ad Studio — v1.1.0 — ¡En vivo!
Cuerpo breve:
- Qué: Lanzamiento de Meta Ad Studio v1.1.0 (Release Candidate -> Production)
- Por qué: Estabilización, mejoras de UX, cobertura completa de tests y optimizaciones de build
- Dónde: https://<tu-dominio>
- Cómo reportar fallos: link al canal de feedback y a Sentry (si público)

## Notas de seguridad
- No pongas tokens en el repositorio. Usa GitHub Secrets y Variables de entorno en Vercel.
- Revisa los logs de despliegue y Sentry inmediatamente después de publicar.

---

Si quieres, puedo también:
- Generar el PR body completo listo para copiar/pegar.
- Crear un `gh`-compatible script que use la CLI para crear el release (si confirmas que tienes `gh` autenticado).

