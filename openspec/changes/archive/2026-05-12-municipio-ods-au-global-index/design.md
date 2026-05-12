## Context

The municipio **ODS** and **Agenda Urbana** overview cards already share `OdsRadialOverviewRose.vue`, driven by `axis-count` (17 vs 6) and the same `values` array as the spider chart. The rose spec (`ods-radial-overview-chart`) reserved the donut center for a future “global index”; the component today only renders the `center` slot when idle, which is empty for both hosts. Wedge hover already shows per-axis title and integer value in the center.

## Goals / Non-Goals

**Goals:**

- Derive the **global index** only from props already on the rose (`values`, `axisCount`) using the same sanitization as wedge lengths (0–100 clamp domain, non-finite → 0).
- Show a **localized** title + formatted mean in the idle center for both taxonomies.
- Keep **hover** as the primary drill-down: hovered axis replaces the center content until pointer leaves.
- Allow the existing **`#center` slot** to override idle presentation when a host needs custom content.

**Non-Goals:**

- New backend fields, SQLite columns, or CSV exports for this index.
- Changing how comparison municipios are encoded (radial is primary-only today; global index is primary-only).
- Altering spider chart (`DoubleSpiderMinMax`) or the radial ↔ spider transition rules.
- Weighted averages, geometric means, or treating missing axes differently from `0` (unless a follow-up explicitly defines weighting).

## Decisions

1. **Definition of global index** — **Unweighted arithmetic mean** of the `axisCount` sanitized values.  
   *Rationale:* Matches the user request (“average of the 17 ODS or 6 LE”), trivial to audit, and stays consistent with a 0–100 interpretability.  
   *Alternative considered:* Median — more robust to outliers but harder to explain to stakeholders and diverges from “average” wording.

2. **Where to compute** — **Inside `OdsRadialOverviewRose.vue`** as a `computed` from `sanitizedValues` (already length `axisCount`).  
   *Rationale:* Single source of truth with wedge rendering; both `IndicadoresView` and `Seguimiento` benefit without duplicating logic.  
   *Alternative considered:* Precompute in parents — duplicates sanitization rules and risks drift.

3. **Idle vs hover vs slot** — Priority: **hover** > **`center` slot (if provided)** > **default global index**.  
   *Rationale:* Preserves current hover UX; slot remains an escape hatch for product experiments without forking the chart.

4. **Number formatting** — Reuse the chart’s existing locale pattern for outside labels (**e.g. one decimal via `es-ES`**) for the global index value so the center does not look like a different metric scale than the rim. Hover can stay integer if that is current behavior (no change required in this design unless spec mandates alignment).

5. **i18n** — New keys such as `municipio.ods.radialGlobalIndexLabel` and `municipio.au.radialGlobalIndexLabel` (exact names up to implementer), passed via a **prop** defaulting to the ODS key so `Seguimiento` can pass the AU key without branching inside the child on taxonomy mode.

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Mean of zeros misleads when data is sparse | Same as today for wedges — out of scope unless product defines “insufficient data” gating at the host (already has `overviewHasMeaningfulData`). |
| Slot + new default confuse integrators | Document priority in component JSDoc / spec; keep slot rarely used. |
| SSR / hydration | Chart is already client-oriented patterns; no new async data. |

## Migration Plan

Ship as a **frontend-only** deploy: no database migration, no coordinated data release. Rollback is reverting the Vue + locale changes.

## Open Questions

- Whether the **hover value** (integer) and **global index** (possibly one decimal) should be visually harmonized — resolve during implementation for consistency with product/design preference.
