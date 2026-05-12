## Why

The shared indicator list (`IndicadoresListView.vue`) shows a second line under each indicator title as `metaCodigo · metaNombre` (for example `4.1 · Promover la competitividad…`). That line is long and repeats wording clients already see elsewhere; they want a compact code in the list and the full meta title only when the user asks for it (hover).

## What Changes

- In the indicator name column, the subtitle below the indicator title shows **only** the meta code (e.g. `4.1`), not the full `code · name` string.
- On **pointer hover** over that subtitle, the same line **inline** shows the full legacy string `` `metaCodigo · metaNombre` `` so it matches how the list looked before the change—without tooltips, popovers, or native `title` for this behavior.
- Behavior applies wherever this list is used (municipio ODS and AU pages that reuse the same component); no change to data shape or APIs unless parsing is centralized in a small helper.

## Capabilities

### New Capabilities

- `municipio-indicadores-list-meta-line`: Requirements for how meta context appears under indicator titles in the shared list (compact code by default, full legacy inline line on pointer hover, no tooltip).

### Modified Capabilities

- None (no existing baseline specs in this repository for this surface).

## Impact

- **App repo** (`diputacion_tarragona`): `app/components/municipio/ods/IndicadoresListView.vue` (render function for the name column subtitle). Possibly a tiny utility if code extraction is needed for tests or reuse.
- **Data repo**: OpenSpec artifacts only unless implementation tasks reference copying nothing from dataset.
