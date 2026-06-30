## MODIFIED Requirements

### Requirement: Catalan translation source files

The data ingestion pipeline SHALL recognize two Google Sheets tabs as the canonical sources of Catalan translations: `diccionario_cat` and `metadatos_agendas_cat`. The download step SHALL fetch both into `dataset/diccionario_cat.csv` and `dataset/metadatos_agendas_cat.csv`, and both SHALL be ingested into the database. Catalan labels for `REGIONES.id_especial2` typology slugs SHALL NOT come from a `regiones_cat` sheet or CSV; they are resolved by consumers via locale-specific i18n. English translation sheets (`metadatos_agendas_en`, `diccionario_en`) SHALL be specified and tested under the `english-translations` capability, not under this specification.

#### Scenario: CAT translation csvs downloaded
- **WHEN** `pullAndBuild/download_and_build.py` runs successfully
- **THEN** `dataset/diccionario_cat.csv` and `dataset/metadatos_agendas_cat.csv` SHALL exist on disk

#### Scenario: REGIONES not sourced from Catalan CSV
- **WHEN** the transform pipeline runs
- **THEN** `REGIONES` SHALL be populated solely from `regiones.csv`
- **AND** no parser SHALL read any `regiones_cat.csv` file
