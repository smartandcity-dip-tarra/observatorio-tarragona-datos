# csv-parsing

## ADDED Requirements

### Requirement: Parse diccionario EN CSV

The system SHALL read `diccionario_en.csv` and produce structured records with the same shape as `diccionario.csv` records: `agenda`, `nivel`, `dimension`, `nombre`, `detalle`, `logo`. Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[english] WARN: dataset/diccionario_en.csv not found — English tables left empty` to stdout.

#### Scenario: Standard diccionario_en file
- **WHEN** the parser reads a valid `diccionario_en.csv` with at least one row
- **THEN** it produces records where `dimension` is the identifier within each `agenda`, mirroring the ES parser

#### Scenario: File missing
- **WHEN** `dataset/diccionario_en.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[english] WARN: dataset/diccionario_en.csv not found — English tables left empty` to stdout

### Requirement: Parse metadata EN CSV

The system SHALL read `metadatos_agendas_en.csv` and produce structured records with the columns the file actually contains, at minimum: `indicador`, `clase`, `nombre`, `detalle`, `unidad`, `formula`. Empty fields SHALL be represented as `null`. If the file is absent, the parser SHALL return an empty array and SHALL emit `[english] WARN: dataset/metadatos_agendas_en.csv not found — English tables left empty` to stdout.

#### Scenario: Standard metadata_en file
- **WHEN** the parser reads a valid `metadatos_agendas_en.csv`
- **THEN** it produces records keyed by `indicador` with English `nombre`, `detalle`, `unidad`, and `formula` where present

#### Scenario: File missing
- **WHEN** `dataset/metadatos_agendas_en.csv` does not exist
- **THEN** the parser SHALL return an empty array
- **AND** the parser SHALL emit `[english] WARN: dataset/metadatos_agendas_en.csv not found — English tables left empty` to stdout

### Requirement: Parse proyectos CSV

The system SHALL read `proyectos.csv` and produce records with fields: `linea`, `objetivo`, `codigo`, `nombre`, `descripcion`. Empty `descripcion` SHALL be `null`.

#### Scenario: Row shape
- **WHEN** the parser reads `proyectos.csv` with a row `linea=1`, `objetivo=1.1`, `codigo=1.1.1`
- **THEN** the parsed record SHALL expose those five fields as strings (after trimming)
