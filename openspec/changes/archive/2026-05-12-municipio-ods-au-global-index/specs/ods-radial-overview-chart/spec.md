## MODIFIED Requirements

### Requirement: Center reserved for global index

The radial overview SHALL reserve the **inner circular region** (radius ≤ `rInner`) for summary content. The component SHALL NOT collapse `rInner` to zero in the default configuration so the layout matches the donut reference.

When the pointer is **not** over a wedge hit target or an outside label row associated with an axis, the center SHALL show the **global index**: the arithmetic mean of the `axisCount` sanitized overview values in index order (`0` through `axisCount - 1`), each value treated as a number in the same **0–100** domain used for wedge radial length (non-finite values treated as **0** before averaging). The displayed value SHALL use **locale-aware** formatting consistent with the rest of the chart (e.g. the same locale and fraction-digit conventions used for outside label values). A concise **title** for the global index SHALL be shown using **`useI18n()`**; the component SHALL accept a prop naming the translation key for that title so **ODS** and **Agenda Urbana** hosts can supply different keys without embedding user-visible Catalan in the template.

When the user hovers an axis (wedge or outside label), the center SHALL temporarily show that axis’s title and value **instead of** the global index, preserving existing per-axis hover semantics until hover ends.

When the host supplies **named slot `center`** content, that content SHALL be used **in place of** the default global index title and value when idle (no axis hover). The slot SHALL NOT suppress the inner hole geometry.

#### Scenario: Idle center shows global mean for seventeen ODS axes

- **WHEN** `axisCount` is 17, seventeen overview values are provided (or padded by the component’s sanitization rules), and no wedge or outside label row is hovered
- **THEN** the center SHALL display the global index title and a numeric value equal to the arithmetic mean of those seventeen sanitized values

#### Scenario: Idle center shows global mean for six AU objectives

- **WHEN** `axisCount` is 6, six overview values are provided (or padded by the component’s sanitization rules), and no wedge or outside label row is hovered
- **THEN** the center SHALL display the global index title and a numeric value equal to the arithmetic mean of those six sanitized values

#### Scenario: Hover replaces global index with axis detail

- **WHEN** the user hovers any axis wedge hit target or its outside label row
- **THEN** the center SHALL show that axis’s hover title and value and SHALL NOT show the global index until hover ends

#### Scenario: Center slot overrides idle global index

- **WHEN** the host renders non-empty content in the `center` slot and no axis is hovered
- **THEN** that slot content SHALL be shown in the inner region **instead of** the default global index title and value

#### Scenario: Donut geometry preserved

- **WHEN** the chart renders in any combination of idle global index, hover, or `center` slot content
- **THEN** `rInner` SHALL remain positive and wedge geometry SHALL remain unchanged relative to the pre-change radial layout
