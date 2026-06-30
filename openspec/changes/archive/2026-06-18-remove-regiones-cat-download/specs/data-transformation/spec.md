## REMOVED Requirements

### Requirement: regiones_cat is not ingested

**Reason**: The `regiones_cat` Google Sheet tab was removed; typology labels for `id_especial2` are handled by frontend i18n keyed on slugs. No `regiones_cat.csv` is part of the dataset.

**Migration**: None — behavior unchanged for transform and API consumers.

## ADDED Requirements

### Requirement: REGIONES id_especial2 labels via consumer i18n

`REGIONES` SHALL be populated solely from `regiones.csv`. The `id_especial2` column SHALL store deterministic slugs derived from the Spanish typology label in `regiones.csv`. Human-readable typology strings SHALL NOT be stored in SQLite; consumers SHALL resolve display labels using the slug with locale-specific i18n resources. No `regiones_cat.csv` file SHALL be expected in the dataset.

#### Scenario: REGIONES built from regiones.csv only
- **WHEN** the transform pipeline runs
- **THEN** `REGIONES` SHALL be populated solely from `regiones.csv`
- **AND** `REGIONES.id_especial2` SHALL contain only slug values derived from `regiones.csv`
- **AND** no parser or transform module SHALL read `regiones_cat.csv`
