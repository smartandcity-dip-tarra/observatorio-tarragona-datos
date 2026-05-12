# municipio-indicadores-list-meta-line Specification

## Purpose

The shared municipio indicadores list (`IndicadoresListView.vue`) shows a compact meta code under each indicator title by default and reveals the full legacy meta line inline when the user hovers the table row, without tooltips or floating UI.

## Requirements

### Requirement: Compact meta code under indicator title

The municipio indicadores list SHALL render, directly under the primary indicator title in the name column, only the meta code (`metaCodigo`) as the secondary line of text. It SHALL NOT show the meta descriptive name on that line by default.

#### Scenario: Row with meta code and name

- **WHEN** a list row has `metaCodigo` set to `4.1` and `metaNombre` set to a non-empty string
- **THEN** the visible subtitle under the indicator title shows `4.1` (trimmed consistently) and does not show `metaNombre` on that line

#### Scenario: Missing meta code

- **WHEN** `metaCodigo` is empty or missing but `metaNombre` is present
- **THEN** the UI shows a deterministic fallback (placeholder or truncated name) and the full meta context remains available via the inline hover behavior described in the next requirement

### Requirement: Full meta line revealed inline on row hover (no tooltip)

The municipio indicadores list SHALL reveal the full meta context string `` `<metaCodigo> · <metaNombre>` `` (same characters, separator, and ordering as the legacy single-line subtitle) **inline** in the name column when the user hovers the pointer over **any part of that row’s table row** (not only the subtitle), so the line **looks the same as the pre-change subtitle** while the row is hovered.

The system SHALL NOT use a tooltip, popover, modal, native `title` tooltip, or any other floating or portaled layer for this behavior.

#### Scenario: Pointer hover shows legacy line

- **WHEN** the user hovers the pointer over the data row for an item that has both `metaCodigo` and `metaNombre`
- **THEN** the subtitle shows the full inline string `` `<metaCodigo> · <metaNombre>` `` in the same typographic treatment as the legacy subtitle (e.g. same text size and color class as the original secondary line), not in an overlay

#### Scenario: No overlay UI

- **WHEN** the full meta line is shown during row hover
- **THEN** no tooltip, popover, or separate floating UI is used to show `metaNombre`; only inline text visibility changes
