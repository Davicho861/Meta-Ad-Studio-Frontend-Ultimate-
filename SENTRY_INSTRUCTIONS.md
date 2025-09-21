# Configuración de Sentry para Meta Ad Studio

Este documento describe cómo habilitar Sentry para la aplicación desplegada en Vercel y cómo validar la recepción de eventos.

## 1) Crear proyecto en Sentry
1. Entra en https://sentry.io y crea una organización/proyecto si no existe.
2. Crea un proyecto de tipo JavaScript (React).
3. Copia el DSN del proyecto.

## 2) Crear token de autenticación (opcional, para integraciones)
1. En Settings > Developer Settings > Auth Tokens, crea un token con scopes `project:write` y `project:read` (y `org:read` si necesitas).
2. Copia el token.

## 3) Añadir secrets en GitHub
1. Ve a GitHub > Repository > Settings > Secrets and variables > Actions > New repository secret.
2. Crea `SENTRY_DSN` con el valor del DSN.
3. Crea `SENTRY_AUTH_TOKEN` con el Auth Token (opcional si lo generaste).

## 4) Configurar variables de entorno en Vercel
1. En Vercel Dashboard > Project > Settings > Environment Variables, añade:
   - `SENTRY_DSN` = (valor)
   - `SENTRY_AUTH_TOKEN` = (valor, optional)
   - `NODE_ENV` = production
2. Guardar y redeploy (o redeploy forzado) para que las variables estén activas.

## 5) Sentry Vite plugin (ya incluido en deps)
El repositorio contiene `@sentry/vite-plugin`. Para que Sentry capture releases y sourcemaps, configura en `vite.config.ts` (si no está ya):

- Asegúrate de que la configuración del plugin incluya `release` ligado a `process.env.npm_package_version` o al tag de git.

## 6) Validación en producción
1. Genera un error de prueba en la app (desde la consola o con una ruta especial) para confirmar recepción en Sentry.
2. En Sentry, filtra por `releases` y por entorno `production`.
3. Asegúrate de que los sourcemaps muestren stack traces legibles.

## 7) Notas de seguridad
- No subas tokens al repositorio.
- Usa GitHub Secrets y variables de entorno de Vercel.

## 8) Ejecutar verificación rápida (manual)
- Desde la consola del navegador en producción, ejecuta `throw new Error('test-sentry-1.1.0')` y confirma que aparece en Sentry.


Si quieres, puedo ejecutar llamadas a la API de Sentry para crear el proyecto o validar la configuración si me proporcionas un token con permisos (no recomendado en el chat); de lo contrario, puedo guiarte paso a paso en la UI.
