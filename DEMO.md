Demo de un solo clic — Meta Ad Studio

Este repositorio incluye un orquestador que ejecuta una demostración visual completa llamada "El Brindis Sincronizado".

Archivo principal

- `run-demo.sh`: script orquestador en la raíz.

Comandos disponibles

- Ejecutar todo (instala dependencias y navegadores si hace falta):

```
./run-demo.sh
```

- Ejecutar rápido en máquina ya preparada (no reinstala dependencias ni navegadores):

```
./run-demo.sh --skip-install --skip-browsers
```

- Grabar trazas y artefactos (traza + screenshots):

```
./run-demo.sh --record
```

- Grabar video además de trazas (activa video en Playwright):

```
./run-demo.sh --record --record-video
```

Artefactos

- Las trazas y artefactos se guardan en `test-results/demo-<timestamp>/`. Cada demo genera un subdirectorio con `trace.zip` y (si está habilitado) `video`.
- Para visualizar la traza:

```
npx playwright show-trace test-results/demo-<timestamp>/<subdir>/trace.zip
```

Notas

- `--playwright-with-deps` instalará dependencias del sistema para navegadores Playwright (puede requerir sudo en Linux). Por defecto no se ejecuta.
- Si el puerto por defecto está ocupado, Playwright/Vite elegirá otro puerto; puedes ajustar `playwright.config.ts` o pasar banderas a `npm run preview` si lo necesitas.

Contacto

- Si quieres que automatice la integración con CI o añada reportes JUnit, dime y lo agrego.
