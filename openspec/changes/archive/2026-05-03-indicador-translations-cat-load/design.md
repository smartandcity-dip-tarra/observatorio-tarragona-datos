## Context

The Diputación de Tarragona platform is bilingual (Spanish + Catalan). The frontend `i18n/locales/{es,ca}.json` covers static UI chrome, but **all data-driven strings** — indicator names, descriptions, agenda dimension labels — currently live only in `METADATA_ES` and `DICCIONARIO_ES`. The schema and API layers were already prepared for Catalan: `METADATA_CAT` and `DICCIONARIO_CAT` exist (empty), and routes like `server/api/au/indicadores.get.ts` already do `LEFT JOIN METADATA_CAT mc ON mc.id_indicador = m.id_indicador` with `COALESCE(mc.nombre, me.nombre, m.id_indicador)`. The missing piece is the data itself.

The client has now provided three new sheets in the source Google Sheets — `regiones_cat`, `diccionario_cat`, `metadatos_agendas_cat` — already downloaded by `pullAndBuild/download_and_build.py` (the `SHEETS` dict already includes them). Row alignment with the Spanish CSVs was verified: 161 indicators in both ES and CAT (perfect overlap), 246 diccionario rows in both. Translation density:

```
metadatos_agendas_cat:
  nombre        161/161  (100%, all real translations)
  detalle       107/161  (rest are NULL or identical)
  unidad         15/161  (mostly identical — units are mostly symbols/numbers)
  formula       105/161  (4 distinct strings, all directional labels)
  clase         all differ ("Descriptiu AUE" — must NOT be used for classification)

regiones_cat:
  id_especial2  7 distinct values, all translated (closed enum, frontend i18n territory)
  every other column = identical to ES
```

This change covers the data-side ingestion (parse, transform, load, integrity, schema) and the API-side coverage extension (`unidad` COALESCE, `direction` enum exposure). Frontend rendering decisions for the new `direction` enum and for `regiones.id_especial2` are deferred to a follow-up `catalan-frontend-i18n-keys` change.

## Goals / Non-Goals

**Goals:**

- Catalan users see Catalan indicator names, descriptions, agenda labels (and units where translated) in every API endpoint that already accepts `?lang=ca`.
- Zero data duplication: Catalan strings live only in `METADATA_CAT` / `DICCIONARIO_CAT`, never in `METADATA` / `DICCIONARIO`.
- Classification (`tipo`) remains language-neutral and stable. The CAT `clase` column is structurally ignored.
- Drift between the ES and CAT spreadsheets is loud in CI logs (per-id warnings + summary), but never fails the build (warn-and-fall-back).
- The fragile sentinel string `formula` ("↑ Ascendente (más = mejor)" / "↑ Ascendent (més = millor)") becomes a small enum (`asc | desc | neutral`) so the localized label can move to the frontend in a follow-up change.

**Non-Goals:**

- Translating municipality names (`REGIONES.nombre`) — these are proper nouns and identical in both languages.
- Loading `regiones_cat.csv` into the database. The only translatable column is `id_especial2` (7 closed-enum values), better handled in the frontend.
- Removing the legacy `formula` field from API responses. Both `formula` and `direction` will be served during a deprecation window.
- Frontend i18n keys for `direction` (`asc`/`desc`/`neutral`) — follow-up spec.
- Migrating `unidad` to a fully translatable model (i.e. moving it out of `METADATA` into `METADATA_ES` / `METADATA_CAT` for both languages). Spanish `unidad` continues to live in `METADATA`; Catalan gets an optional override column in `METADATA_CAT`.

## Decisions

### Decision 1 — `unidad` lives in `METADATA_CAT` as an optional override

**Choice:** Add `unidad TEXT` (nullable) to `METADATA_CAT`. Server queries that already do `LEFT JOIN METADATA_CAT mc` extend their SELECT to `COALESCE(mc.unidad, m.unidad) AS unidad` when `lang=ca`.

**Why over alternatives:**

- *Move `unidad` to `METADATA_ES`/`METADATA_CAT` for both languages*: cleanest long-term but requires touching every `m.unidad` reference (4–5 server routes) and breaking the existing `METADATA.unidad` neutral contract. Postpone.
- *Leave Spanish unit leaking through to Catalan UI*: cheap but lossy ("x1.000 mujeres" stays Spanish in CAT mode). Rejected — the client provided real translations.
- **Chosen**: additive, minimum disruption. The 146 indicators where ES and CAT units are identical have `METADATA_CAT.unidad = NULL` and naturally fall back. Only the 15 truly different rows store a value.

**Loader rule**: when transforming `metadatos_agendas_cat`, set `METADATA_CAT.unidad` only if the CAT value is non-empty AND differs from the ES value. Identical translations are stored as `NULL` to keep the table sparse.

### Decision 2 — Normalize `formula` to a `direction` enum on `METADATA`

**Choice:** Add `direction TEXT` to `METADATA`. Derive it from the Spanish `formula` field via a curated mapping at transform time. The original `formula` text remains in `METADATA.formula` for the deprecation window. The CAT `formula` column is **not stored** — its values are validated against the same mapping but only as an integrity check.

**Mapping table** (initial; extend as new sentinels appear):

```
"↑ Ascendente (más = mejor)"   → "asc"
"↑ Ascendent (més = millor)"    → "asc"   (CAT validation only)
"↓ Descendente (menos = mejor)" → "desc"
"↓ Descendent (menys = millor)"  → "desc"   (CAT validation only)
"" / NULL                        → NULL
<anything else>                  → NULL + warning
```

**Why over alternatives:**

- *Translate `formula` like `unidad` (add `formula` to METADATA_CAT)*: works mechanically but treats UI copy as data. The string is a sentinel with 2–3 distinct values; storing it 161× per language is duplication. Rejected.
- *Leave it in `METADATA` and accept Spanish leak*: same issue as Decision 1's lossy variant, but worse because the entire string IS the localization. Rejected.
- **Chosen**: store the semantic value (`direction`) once, language-neutrally; render the localized label in the frontend via i18n keys (follow-up change). The integrity check uses the CAT mapping to validate the client didn't introduce a new sentinel.

**API contract during deprecation**: indicator `metadata` payloads include both `formula` (raw Spanish text from `METADATA.formula`) and `direction` (`'asc' | 'desc' | 'neutral' | null`). Frontend keeps reading `formula` until the follow-up change swaps it for i18n-keyed rendering off `direction`. After that, `formula` can be removed from the response.

### Decision 3 — Ignore `clase` from CAT

**Choice:** The `clase` column in `metadatos_agendas_cat.csv` is read by the parser only for the integrity check described in Decision 5; it is never written to `METADATA.tipo` or anywhere else. Classification is fully owned by the Spanish `clase` via `transformMetadata.normalizeTipo`.

**Why:** "Descriptiu AUE" and "Descriptivo AUE" would partition the indicators into two non-comparable taxonomies depending on language. The whole pipeline keys off `METADATA.tipo` (`'agenda' | 'ods' | 'descriptivo'`) — that must stay language-neutral.

### Decision 4 — Skip `regiones_cat.csv` ingestion

**Choice:** The pipeline downloads `regiones_cat.csv` (already does today via `download_and_build.py`) but `transform/src/parse/regiones.ts` does NOT read it. The ingestion stays single-language: `REGIONES` is populated only from `regiones.csv`.

**Why:** The only translatable column (`id_especial2`) takes 7 distinct values across 185 rows. Storing the translation per row would mean 178 redundant rows. Frontend i18n keys are a better fit, deferred to a follow-up change. Until that lands, Catalan users see Spanish region grouping pills — this is a known, scoped regression.

### Decision 5 — Warn-and-fall-back integrity policy

**Choice:** No CAT-related integrity failure SHALL exit with code 1. Each problem is logged with a stable prefix (`[catalan]`) plus enough detail for `grep` to find it in CI logs. The build still produces a database; readers fall back to ES via the existing `COALESCE`. Specifically:

| Condition                                                | Behavior                                                       |
| -------------------------------------------------------- | -------------------------------------------------------------- |
| CAT csv missing entirely                                 | `[catalan] WARN: <file> not found — Catalan tables left empty` |
| `id_indicador` in CAT not in ES `METADATA`               | `[catalan] WARN: dropping CAT translation for unknown id <id>` |
| `id_dict` in CAT not in ES `DICCIONARIO`                 | same shape, dropped                                            |
| ES indicator has no CAT row                              | `[catalan] WARN: missing CAT translation for <id>` (one per id) |
| CAT `nombre` empty while ES non-empty                    | warning, falls back via COALESCE                               |
| CAT `clase` introduces a tipo value not in ES            | warning (does not affect classification — `clase` is ignored)  |
| Spanish `formula` not in known direction mapping         | `[catalan] WARN: unknown formula sentinel <text> — direction = NULL` |
| CAT `formula` not in known direction mapping             | warning (CAT `formula` is not stored, this is validation only) |

After all warnings are logged, the transform prints a one-line summary:

```
[catalan] METADATA_CAT: 161 loaded, 0 dropped, 0 missing — DICCIONARIO_CAT: 246 loaded, 0 dropped — direction: 158 mapped, 3 unknown (NULL)
```

This makes a single grep tell us the full Catalan health of the build.

**Why:** Failing the build on translation drift would block deploys whenever the client tweaks a sentence. The COALESCE-to-ES path is robust enough to ship with partial translations. We trade hard guarantees for visibility.

### Decision 6 — Schema additions are the only schema changes

**Choice:** Two columns added, both nullable, both via `ALTER TABLE` semantics (in practice via the existing schema-creation step that drops + recreates the DB on every build):

```sql
ALTER TABLE METADATA_CAT ADD COLUMN unidad TEXT;
ALTER TABLE METADATA   ADD COLUMN direction TEXT;
```

The pipeline rebuilds the SQLite file from scratch on every run (`unlinkSync(output)` in `transform/src/index.ts`), so this is just an update to `transform/src/schema/tables.ts`.

**Why:** Anything more invasive (new tables, renames) was unnecessary once we settled on Decisions 1–4.

## Risks / Trade-offs

- **Decision 2 introduces a temporary dual-source for direction labels** → during the deprecation window, `formula` (Spanish text) and `direction` (enum) coexist. Mitigation: tasks.md explicitly schedules a follow-up frontend change that swaps `formula` consumption for i18n-keyed `direction` rendering, after which `formula` is removed from the API response.

- **`unidad` overrides are sparse and easy to forget** → a future indicator added in CAT with a translatable unit (e.g. "x1.000 mujeres") that's marked identical to ES would silently leak Spanish. Mitigation: integrity check explicitly compares ES/CAT `unidad` per indicator and warns when they differ but the override is empty (i.e. when the editor probably forgot to fill it in).

- **Warn-and-fall-back can hide gradual rot** → if nobody reads CI logs, Catalan can drift quietly. Mitigation: the per-build summary line goes to stdout in a stable, greppable format. A future change can wire it to a CSV-integrity-style HTML report (`docs/csv-integrity/`) so it's visible from the dashboard.

- **`regiones_cat.csv` is downloaded but unused** → wasted bandwidth + risk of confusion ("why is the file there if we don't read it?"). Mitigation: keep the download (the file is small and the next change will need it), document the intentional skip in `data-transformation` spec, leave a comment in `transform/src/parse/regiones.ts`.

- **The `formula → direction` mapping table can drift** → if the client adds a new sentinel ("⇄ Bidireccional"), the integrity check catches it and `direction` is `NULL`, so the indicator works but loses its directional cue. Mitigation: the integrity warning makes this a one-line CI log fix (add to mapping). Document the mapping as a single source-of-truth constant under `transform/src/transform/` so it's easy to update.

## Migration Plan

This is an additive change applied through the standard build pipeline:

1. **Phase 0 — Pre-merge checks**: with the change merged into the data repo `main`, run `pnpm transform` locally against `dataset/`. Confirm:
   - `METADATA_CAT` row count ≈ 161 (= ES indicator count).
   - `DICCIONARIO_CAT` row count ≈ 246.
   - The `[catalan]` summary line shows zero `dropped` and zero `missing`.
   - The build exits 0.

2. **Phase 1 — Frontend wiring**: in the frontend repo, update the affected server routes (`server/api/au/indicadores.get.ts`, `server/api/ods/indicadores.get.ts`, `server/api/indicadores/valores.get.ts`, `server/api/au/objetivo-indicadores.get.ts`, `server/api/ods/objetivo-indicadores.get.ts`, `server/api/municipios/[ine]/header.get.ts`) to:
   - extend `COALESCE` on `unidad` for `lang=ca`;
   - add `metadata.direction` to the response shape.
   - The `formula` field continues to be served unchanged.

3. **Phase 2 — Deploy data**: run the existing automated data-release pipeline (the in-progress `automate-data-release-sync` change handles this). Once the new DB is published, all `?lang=ca` requests pick up Catalan translations automatically — no client deploy required.

4. **Phase 3 — Frontend deploy**: deploy the API changes from Phase 1. Catalan units start displaying; `direction` becomes available for client consumption.

5. **Phase 4 (follow-up change)**: `catalan-frontend-i18n-keys` change adds:
   - i18n keys for `direction` (3 keys × 2 locales = 6 entries).
   - i18n keys for `regiones.id_especial2` (7 keys × 2 locales = 14 entries).
   - Removes `formula` from API responses; updates frontend to render `direction` via i18n.

**Rollback**: drop the change at the data-repo level → next pipeline run regenerates the DB without the new columns and tables. The API extension is additive — old DBs simply have empty `METADATA_CAT.unidad` and `METADATA.direction = NULL`, both handled by `COALESCE`. Worst case: Catalan units regress to Spanish (the current state). No data corruption is possible because no existing column is modified.

## Open Questions

None blocking. The follow-up scope is well-defined under "Phase 4" of the migration plan.
