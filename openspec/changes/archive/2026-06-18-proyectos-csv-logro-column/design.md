## Context

`proyectos.csv` is tracked by the CSV integrity runner (`check-csv.ts` → `integrity/runner.ts`). Header parity is enforced via `CSV_HEADER_CONTRACTS` in `column-contracts.ts`; format checks use `REQUIRED_CSV_FILES` in `config.ts`. The on-disk file now has six columns:

```
linea,objetivo,codigo,nombre,descripcion,logro
```

The `header-parity-proyectos.csv` check fails because `logro` is not in the contract. The transform parser (`parse/proyectos.ts`) maps only the original five fields; `readCsv` already tolerates extra columns without error.

## Goals / Non-Goals

**Goals:**

- Unblock CI by aligning the integrity contract with the client-delivered `proyectos.csv` header.
- Keep a single source of truth for the full header set (`column-contracts.ts`) and required columns (`config.ts`).
- Update unit-test fixtures so local integrity tests match production CSV shape.

**Non-Goals:**

- Persisting `logro` in SQLite `PROYECTOS` or exposing it via the Nuxt agenda API.
- Validating `logro` values (type, range, or referential integrity).
- Changing parser `ProyectoRecord` or loader column lists.

## Decisions

1. **Contract-only update (not full pipeline)** — Add `logro` to integrity contracts only; leave parse/schema/load unchanged.
   - *Rationale*: User confirmed the column is acceptable; the immediate failure is the header-parity test. Parser already ignores unmapped CSV columns. A follow-up change can ingest `logro` when the app needs it.
   - *Alternative rejected*: Full pipeline update (parse + DDL + loader) — unnecessary scope for fixing the integrity failure.

2. **Column order** — Contract list: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`, `logro` (matches current CSV header order).
   - *Rationale*: Header parity checks compare exact sets; order in the contract array should mirror the file for maintainability.

3. **Required column** — Include `logro` in `REQUIRED_CSV_FILES` required columns for `proyectos.csv`.
   - *Rationale*: If the client always ships this column, format checks should fail when it is missing—consistent with other contracted columns.

4. **No new data integrity check for `logro`** — Do not add uniqueness, non-empty, or numeric validation.
   - *Rationale*: Out of scope until product defines semantics for the field.

## Risks / Trade-offs

- **[Risk] `logro` data silently dropped at transform** → Acceptable for this slice; document in proposal/non-goals. Future ingest change should reference this contract.
- **[Risk] Contract drift if only integrity is updated** → `column-contracts.ts` comment already says “keep in sync with parse + schema”; add a note in tasks to revisit when `logro` is loaded into SQLite.
- **[Trade-off] No runtime use of `logro`** → App behaviour unchanged; column exists only in source CSV and integrity reports.

## Migration Plan

1. Update `column-contracts.ts` and `config.ts`.
2. Update `data.test.ts` fixture header.
3. Run `npm run check:csv` from `transform/`; commit regenerated `docs/csv-integrity/*`.
4. No database migration or app deploy required.

## Open Questions

- None for this slice. If the client later defines `logro` semantics (e.g. achievement tier 1–N), a separate change can add parser types, SQLite column, and optional value checks.
