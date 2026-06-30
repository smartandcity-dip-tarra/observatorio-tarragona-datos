## Context

The data pipeline downloads Google Sheets tabs into `dataset/*.csv`, then the Node transform builds SQLite. Catalan translations for indicators and dictionary come from `diccionario_cat` and `metadatos_agendas_cat`. A third sheet, `regiones_cat`, was added historically for Catalan labels on `id_especial2` (a 7-value closed enum), but ingestion was always skipped. The slug-based `REGIONES.id_especial2` approach (archived change `integrate-en-proyectos-slug-regiones`) moved display labels to frontend i18n. The client has since removed the `regiones_cat` tab from the spreadsheet.

## Goals / Non-Goals

**Goals:**

- Eliminate the spurious "Hoja no encontrada" warning on every download run.
- Align active OpenSpec requirements with actual pipeline behavior.
- Remove orphaned CSV files from both repos.

**Non-Goals:**

- Re-introducing a Catalan regions sheet or ingesting region translations into SQLite.
- Changing slug derivation or frontend i18n keys.
- Editing archived OpenSpec changes.

## Decisions

1. **Remove from `SHEETS` only** — No transform, schema, or API changes. The download script is the sole code path that referenced `regiones_cat`.
2. **Delete on-disk CSVs** — `dataset/regiones_cat.csv` and `diputacion_tarragona/test/dataset/regiones_cat.csv` are not referenced by any test or parser; safe to delete.
3. **Spec deltas over inline edits** — Update `catalan-translations` and `data-transformation` via change deltas so archive merges the new truth into `openspec/specs/`.

## Risks / Trade-offs

- **[Risk] Someone re-adds the sheet later** → Mitigation: specs document i18n as the canonical path; no parser will exist to consume it.
- **[Risk] Stale local copies** → Mitigation: deletion is explicit in tasks; download no longer refreshes the file.
