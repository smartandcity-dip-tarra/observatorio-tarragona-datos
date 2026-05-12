## Context

The municipio ODS indicators overview today mounts `DoubleSpiderMinMax` for the 17-value overview whenever data exists, including when **no** comparison municipios are selected. The client prefers a **radial bar (rose)** layout for that single-city case, matching the structure of the Visor2030 reference SVG: fixed donut hole, full gray wedge backgrounds, variable-length colored arcs, and **always-visible** labels outside the ring (right half `start`, left half `end`). The spider chart stays the correct visualization when **one or two** comparisons are active. Implementation lives in the Nuxt app (`diputacion_tarragona`); charts already use Vue-rendered SVG with selective D3 helpers (`DoubleSpiderMinMax.vue` uses `useElementSize`, computed geometry, and `d3-line` for paths only).

## Goals / Non-Goals

**Goals:**

- Ship a **dedicated SFC** for the radial overview with **visual parity** to the reference (layer order, annular sectors, label placement pattern, optional interaction layer).
- Introduce a **shared polar layout helper** (angles, and any constants both charts should agree on) consumed by **both** `DoubleSpiderMinMax` and the new component to avoid drift in axis ordering (ODS 1 at top, clockwise).
- Wire the overview region in the host view(s) to choose **radial vs spider** from `comparisons.length`, and wrap the swap in a **Vue `<Transition>`** with sensible CSS (opacity / slight scale), `ClientOnly` + skeleton unchanged from existing patterns.
- Reserve the **center donut** for a future global index (prop, slot, or placeholder text) without blocking merge on that metric’s spec.

**Non-Goals:**

- Single-SVG morphing or merging spider and radial into one component tree for D3-imperative transitions.
- Backend, SQLite, or CSV pipeline changes.
- Changing spider chart **normative** behavior beyond safe refactors to **import** shared layout (no legend or tooltip regressions).

## Decisions

1. **Shared module location and surface**  
   - **Decision**: Add `app/utils/odsPolarLayout.ts` (or `composables/useOdsPolarLayout.ts` if stateful later; prefer **pure functions** first) exporting `angleForIndex(i, axisCount)`, `DEFAULT_ODS_COLORS`, and optionally `TAU` / index→ODS number helpers.  
   - **Rationale**: Matches “small shared elements” without over-abstracting radii (spider inner/outer differs from rose inner/outer in px but **angles must match**).  
   - **Alternative**: Duplicate angle math in both files — rejected to prevent subtle rotation bugs.

2. **Radial geometry**  
   - **Decision**: Mirror the reference topology: inner radius `rInner`, outer maximum `rOuter` derived from `min(width,height)` and the same responsive spirit as the spider (`useElementSize`, minimum width floor ~320). Gray **full** annulus sectors from `rInner`→`rOuter`; colored arcs share `rInner` and extend to `rInner + t*(rOuter-rInner)` for normalized value `t`.  
   - **Rationale**: Matches provided SVG and client screenshot.  
   - **Alternative**: Bars from center (no hole) — rejected; center reserved for global index.

3. **D3 usage**  
   - **Decision**: Use `d3-shape`’s `arc` (or equivalent path generation) in script to build `d` strings; render with Vue `v-for` like the spider.  
   - **Rationale**: Consistent with existing hybrid approach; no mandatory `d3.select` lifecycle.

4. **Domain for radial lengths**  
   - **Decision**: Default **0–100** linear mapping to bar length for the rose, consistent with current spider overview values, unless `domainMode`/signed is explicitly required later. If the host passes values outside `[0,100]`, clamp for **length** only; document in component JSDoc.  
   - **Rationale**: Radial bars are not a natural fit for signed ranges; single-city overview in product is expected non-negative.  
   - **Alternative**: Full signed spider domain — deferred unless data proves otherwise.

5. **Labels**  
   - **Decision**: One `<text>` group per ODS at precomputed `transform="translate(x,y)"` positions outside `rOuter`, Catalan/Spanish via existing `t('ods_N_name')` and optional short line for value. Right semicircle indices use `text-anchor="start"`, left use `"end"` (same rule as reference).  
   - **Rationale**: Meets “always visible” requirement and matches reference SVG semantics.

6. **Vue transition**  
   - **Decision**: `<Transition name="ods-overview-chart">` with paired enter/leave classes; prefer **`mode="out-in"`** if height differs slightly, else `default` if layouts are stable.  
   - **Rationale**: Traditional Vue boundary as requested; avoids layout thrash.

7. **Secondary hosts**  
   - **Decision**: Apply the same radial-vs-spider rule anywhere `DoubleSpiderMinMax` is used for the **same overview semantics** (e.g. `Seguimiento.vue` if it passes empty comparisons for single-city AU).  
   - **Rationale**: Consistent UX; exact files listed in tasks after grep.

## Risks / Trade-offs

- **[Risk] Label crowding on narrow widths** → Mitigation: slightly reduce font size below a breakpoint or shorten copy to “ODS n” + value; optional `clamp` in design tokens.  
- **[Risk] DoubleSpider refactor regression** → Mitigation: keep extracted helpers **pure**; run existing manual checks on comparison hover/dots.  
- **[Risk] Transition jank** if chart heights differ → Mitigation: set **min-height** on wrapper to max of both charts’ legend + SVG footprint.  
- **[Trade-off]** Global index not specified yet → Mitigation: render **slot** or empty centered group with stable dimensions so layout does not jump when the number arrives.

## Migration Plan

Not applicable (frontend-only feature flag absent; ship directly). Rollback: revert host switch to always mount spider.

## Open Questions

- Exact **global index** copy and computation (user will add spec later) — placeholder only.  
- Whether **AU Seguimiento** overview must match ODS radial visually in v1 (tasks will verify usage).
