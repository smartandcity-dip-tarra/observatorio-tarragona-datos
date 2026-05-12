## 1. Implement compact meta line with inline hover reveal

- [x] 1.1 In `diputacion_tarragona/app/components/municipio/ods/IndicadoresListView.vue`, replace the subtitle so the default line shows only `metaCodigo` when both code and name exist (with the spec fallback when code is missing).
- [x] 1.2 Use CSS only (e.g. Tailwind `group` / `group-hover` on the subtitle wrapper) so that on pointer hover the subtitle shows the full inline `` `${metaCodigo} · ${metaNombre}` `` like the legacy line. Do not use `UTooltip`, `UPopover`, or `title` for this.
- [x] 1.3 Manually verify on municipio ODS and AU pages: default shows code only; hover shows the full inline `code · name`; comparison mode layout unchanged.

## 2. Verification

- [x] 2.1 Run existing frontend checks (typecheck / unit tests if present) for the app package and fix any regressions from the component change.
