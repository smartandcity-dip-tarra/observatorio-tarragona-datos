# Follow-up: Nuxt app (`diputacion_tarragona`)

After the SQLite build ships slugified `REGIONES.id_especial2` and English tables:

1. **Region typology display**: Replace any UI that showed raw Spanish `id_especial2` with i18n keys matching the slug (e.g. `municipios-industriales`), or a small map keyed by slug.
2. **`lang=en` API**: Extend server queries with `COALESCE(METADATA_EN.nombre, METADATA_ES.nombre)` (and dictionary / units) where Catalan already uses `*_CAT`.
3. **Projects section**: Replace bundled `~/assets/data/projects.csv` with an HTTP endpoint that reads `PROYECTOS` (separate endpoint spec).
