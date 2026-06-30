# Arquitectura de datos y despliegue — Diputació de Tarragona

## Estado actual (desarrollo)

- El dataset vive en `diputacion_tarragona_data/dataset/` como CSVs locales
- El script `pullAndBuild/exportador_agendas.py` calcula los agregados a partir de esos CSVs (entrada ZIP → salida ZIP). No se modifica.
- El script `pullAndBuild/download_and_build.py` es el nuevo orquestador: descarga las hojas de Google Sheets y calcula los agregados, escribiendo todo directamente en `dataset/`
- El pipeline Node (`transform/`) lee los CSVs y genera `output/diputacion_tarragona.db` (SQLite)
- El proyecto Nuxt lee el `.db` localmente via `DATABASE_PATH` o la ruta relativa por defecto `../diputacion_tarragona_data/output/diputacion_tarragona.db`

---

## Fuente de datos: Google Sheets

- **Spreadsheet ID:** `1Ck5mVWOn6OhMjoB00nK9zp-i6Z5UOBuQ3_URPiMKC20`
- **Visibilidad:** privado (requiere autenticación)
- **Autenticación:** Service Account de Google Cloud (JSON de credenciales)
  - Local: `pullAndBuild/credentials.json` (en `.gitignore`, nunca se commitea)
  - CI/CD: variable de entorno `GOOGLE_CREDENTIALS_JSON` con el contenido del JSON
- **Setup requerido:**
  1. Proyecto en Google Cloud Console con Google Sheets API activada
  2. Service Account creada → clave JSON descargada
  3. Spreadsheet compartido con el email de la service account (rol Viewer)

---

## Pipeline completo (objetivo futuro)

```
Google Sheets (privado)
  ↓ download_and_build.py (Python)
dataset/*.csv  (7 archivos originales + 3 agregados)
  ↓ transform/ (Node/TypeScript, pnpm run transform)
output/diputacion_tarragona.db  (SQLite)
  ↓ subir como GitHub Release asset (tag: latest-data)
https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/releases/download/latest-data/diputacion_tarragona.db
  ↓ scripts/download-db.mjs (pre-build en Netlify)
nuxt generate  (prerenderiza todo consumiendo el .db)
  ↓ Netlify
Sitio estático desplegado (sin base de datos en runtime)
```

---

## GitHub Actions (repo: diputacion_tarragona_data)

Workflow a crear: `.github/workflows/update-dataset.yml`

**Pasos:**
1. Setup Python 3.11 → `pip install -r pullAndBuild/requirements.txt`
2. Ejecutar `python pullAndBuild/download_and_build.py` (descarga Sheets + agrega CSVs)
3. Setup Node 22 + pnpm 10.29.3 → `pnpm install --frozen-lockfile` en `transform/`
4. Ejecutar `pnpm run transform` en `transform/` (genera el `.db`)
5. Crear/actualizar GitHub Release con tag `latest-data` subiendo el `.db`
6. (Opcional) Commit de `dataset/` si se quiere versionar los CSVs en git

**Secreto requerido:** `GOOGLE_CREDENTIALS_JSON` (contenido del JSON de service account)

**Trigger sugerido:** cron semanal + `workflow_dispatch` para ejecución manual

### Ejemplo de workflow

```yaml
name: Update dataset

on:
  schedule:
    - cron: "0 6 * * 1"   # cada lunes a las 06:00 UTC
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"

      - name: Install Python dependencies
        run: pip install -r pullAndBuild/requirements.txt

      - name: Download sheets & compute aggregates
        env:
          GOOGLE_CREDENTIALS_JSON: ${{ secrets.GOOGLE_CREDENTIALS_JSON }}
        run: python pullAndBuild/download_and_build.py

      - uses: actions/setup-node@v4
        with:
          node-version: "22"

      - uses: pnpm/action-setup@v4
        with:
          version: 10.29.3

      - name: Install Node dependencies
        run: pnpm install --frozen-lockfile
        working-directory: transform

      - name: Transform CSVs → SQLite
        run: pnpm run transform
        working-directory: transform

      - name: Upload .db to GitHub Release (tag: latest-data)
        uses: softprops/action-gh-release@v2
        with:
          tag_name: latest-data
          name: "Latest dataset"
          files: output/diputacion_tarragona.db
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Nuxt en Netlify (objetivo futuro)

### Cambios necesarios en el proyecto Nuxt

**1. `netlify.toml`** en la raíz del proyecto Nuxt:

```toml
[build]
  command   = "node scripts/download-db.mjs && pnpm run build"
  publish   = ".output/public"

[build.environment]
  NODE_VERSION  = "20"
  DATABASE_PATH = "./diputacion_tarragona.db"
```

**2. `scripts/download-db.mjs`** — descarga el `.db` desde la GitHub Release antes del build:

```js
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

const DB_URL = 'https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/releases/download/latest-data/diputacion_tarragona.db'

const response = await fetch(DB_URL, {
  headers: process.env.GH_TOKEN
    ? { Authorization: `Bearer ${process.env.GH_TOKEN}` }
    : {}
})

if (!response.ok) {
  throw new Error(`Error descargando el .db: ${response.status} ${response.statusText}`)
}

await pipeline(response.body, createWriteStream('diputacion_tarragona.db'))
console.log('✅ Base de datos descargada correctamente')
```

**3. `nuxt.config.ts`** — revisar que todas las rutas necesarias estén en `nitro.prerender.routes` para generación estática completa.

### Variables de entorno en Netlify

| Variable | Descripción |
|---|---|
| `DATABASE_PATH` | Ruta local al `.db` descargado durante el build |
| `GH_TOKEN` | Token de GitHub (solo si el repo de datos es privado) |

---

## Decisiones clave

| Decisión | Elección | Motivo |
|---|---|---|
| Autenticación Google Sheets | Service Account (no API key) | La hoja es privada; las API keys solo sirven para recursos públicos |
| Almacenamiento del `.db` para CI/CD | GitHub Release con tag fijo `latest-data` | URL estable y permanente, sin expiración |
| Estrategia de despliegue Nuxt | Generación estática (Scenario C) | El `.db` solo se necesita en build time; en runtime el sitio es completamente estático |
| `exportador_agendas.py` | No modificar | Contiene la lógica de cálculo de agregados validada; el nuevo script adapta solo el I/O |
| Artifacts vs Release para el `.db` | GitHub Release | Los artifacts expiran (90 días) y requieren la API para acceder; las releases tienen URL fija permanente |
