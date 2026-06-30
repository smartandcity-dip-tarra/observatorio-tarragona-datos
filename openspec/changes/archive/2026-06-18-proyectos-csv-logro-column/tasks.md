## 1. Integrity contract

- [x] 1.1 Add `logro` as the sixth entry in `CSV_HEADER_CONTRACTS['proyectos.csv']` in `transform/src/integrity/column-contracts.ts`.
- [x] 1.2 Add `logro` to `requiredColumns` for `proyectos.csv` in `transform/src/integrity/config.ts`.

## 2. Tests and fixtures

- [x] 2.1 Update the `proyectos.csv` sample header in `transform/src/integrity/checks/data.test.ts` to include `logro` (with a sample value in the data row if needed for parse checks).
- [x] 2.2 Run integrity/unit tests from `transform/` and confirm no regressions.

## 3. Verification and reports

- [x] 3.1 Run `npm run check:csv` from `transform/` against `dataset/` and confirm `header-parity-proyectos.csv` passes.
- [x] 3.2 Commit regenerated `docs/csv-integrity/results.json` and `index.html` with all checks green.
