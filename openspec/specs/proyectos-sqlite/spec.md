# proyectos-sqlite Specification

## Purpose

Persist agenda urban project catalogue rows from `dataset/proyectos.csv` into SQLite as a standalone `PROYECTOS` table for consumption by a future HTTP endpoint (out of scope for the transform-only slice).

## Requirements

### Requirement: Create PROYECTOS table

The system SHALL create a `PROYECTOS` table with columns: `codigo` (TEXT PRIMARY KEY NOT NULL), `linea` (TEXT NOT NULL), `objetivo` (TEXT NOT NULL), `nombre` (TEXT NOT NULL), `descripcion` (TEXT).

#### Scenario: Primary key on codigo
- **WHEN** the schema is created
- **THEN** `PROYECTOS.codigo` is the PRIMARY KEY

#### Scenario: Row loaded from CSV
- **WHEN** the transform loads a valid parsed proyectos record
- **THEN** the database contains exactly one `PROYECTOS` row with the same `codigo`, `linea`, `objetivo`, `nombre`, and `descripcion`

### Requirement: Duplicate codigo fails the build

If two rows in `proyectos.csv` share the same non-empty `codigo`, the transform SHALL exit with a non-zero status and SHALL print a clear error naming the duplicated `codigo`.

#### Scenario: Duplicate detection
- **WHEN** `proyectos.csv` contains two rows with `codigo = "2.1.1"`
- **THEN** the build SHALL fail before committing final inserts
