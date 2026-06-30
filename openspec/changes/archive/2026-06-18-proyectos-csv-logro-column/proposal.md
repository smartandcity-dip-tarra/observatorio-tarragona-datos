## Why

The client added a `logro` column to `proyectos.csv`. The CSV integrity header-parity check still expects the original five-column contract, so `npm run check:csv` fails with `Unexpected columns: logro` even though the new column is valid and should be accepted.

## What Changes

- Extend the canonical header contract for `proyectos.csv` to include `logro` as the sixth column (after `descripcion`).
- Add `logro` to the required-columns list used by format checks for `proyectos.csv`.
- Update integrity test fixtures that embed a `proyectos.csv` sample header so they match the new contract.
- Regenerate `docs/csv-integrity/results.json` (and HTML report) so CI passes after the contract update.

Parser, SQLite `PROYECTOS` schema, and API responses are **unchanged** in this slice — `logro` is accepted at the CSV contract level only; extra columns continue to be ignored by the transform until a future change needs them in the database.

## Capabilities

### New Capabilities

_None._

### Modified Capabilities

- `dataset-csv-column-parity`: The canonical column list for `proyectos.csv` SHALL include `logro` alongside the existing five fields.

## Impact

- **Code**: `transform/src/integrity/column-contracts.ts`, `transform/src/integrity/config.ts`, `transform/src/integrity/checks/data.test.ts` (fixture header).
- **Reports**: `docs/csv-integrity/results.json` and `index.html` after re-running `npm run check:csv`.
- **Out of scope**: `parse/proyectos.ts`, `schema/tables.ts`, `load/loader.ts`, Nuxt `agenda/proyectos` API.
