# PR: chore(release): Prepare for v1.1 launch

Resumen:
Este PR prepara el repositorio para el lanzamiento oficial v1.1.0. Contiene cambios de limpieza, ajustes de tipado, correcciones menores y la versión final empaquetada.

Qué incluye:
- Limpieza y refactorizaciones menores.
- Validaciones tipadas y arreglos encontrados en el ciclo de endurecimiento.
- Artefacto de release: `meta-ad-studio-release-v1.1.zip` (adjunto en la Release en GitHub).

Checklist (CI):
- [ ] Lint (`npm run lint`) — pasado
- [ ] Tests unitarios (`npm run test`) — verdes
- [ ] E2E (Playwright) — verdes
- [ ] Build (`npm run build`) — completado

Instrucciones para el mantenedor que aprueba:
1. Revisa los checks automáticos listados arriba.
2. Si todo pasa, fusiona el PR a `main`.
3. Tras la fusión, ejecuta `./scripts/release.sh` desde la rama `main` para crear y empujar el tag `v1.1.0`.
4. Crea la Release en GitHub y adjunta `meta-ad-studio-release-v1.1.zip` (o usa `./scripts/gh_release.sh` si tienes `gh` autenticado).

Notas:
- No se han incluido cambios funcionales; la base de código está congelada.
- No se añaden tokens o secretos en el repositorio; utiliza GitHub Secrets y variables de entorno en Vercel.

