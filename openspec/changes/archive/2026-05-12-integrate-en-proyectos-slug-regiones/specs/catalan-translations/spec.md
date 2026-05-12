# catalan-translations

## MODIFIED Requirements

### Requirement: Catalan translation source files

The data ingestion pipeline SHALL recognize three Google Sheets tabs as the canonical sources of Catalan translations: `regiones_cat`, `diccionario_cat`, and `metadatos_agendas_cat`. The download step SHALL fetch all three into `dataset/regiones_cat.csv`, `dataset/diccionario_cat.csv`, and `dataset/metadatos_agendas_cat.csv`. Of these, only `diccionario_cat.csv` and `metadatos_agendas_cat.csv` SHALL be ingested into the database; `regiones_cat.csv` SHALL be retained on disk but ignored by the transform step. English translation sheets (`metadatos_agendas_en`, `diccionario_en`) SHALL be specified and tested under the `english-translations` capability, not under this specification.

#### Scenario: All three CAT csvs downloaded
- **WHEN** `pullAndBuild/download_and_build.py` runs successfully
- **THEN** `dataset/regiones_cat.csv`, `dataset/diccionario_cat.csv`, and `dataset/metadatos_agendas_cat.csv` SHALL exist on disk

#### Scenario: regiones_cat is intentionally not ingested
- **WHEN** the transform pipeline runs
- **THEN** `REGIONES` SHALL be populated solely from `regiones.csv`
- **AND** no parser SHALL read `regiones_cat.csv`
