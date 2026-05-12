# agenda-projects-api

## ADDED Requirements

### Requirement: Single GET endpoint returns all PROYECTOS rows

The Nuxt server SHALL expose a **read-only** HTTP GET endpoint that loads **all** agenda urban project rows from SQLite table **`PROYECTOS`** using **one** SQL statement (no per-row or per-LE queries). The response body SHALL be a JSON **array** of objects. Each object SHALL include at least the string fields **`linea`**, **`objetivo`**, **`nombre`**, and **`descripcion`** (null/empty in DB mapped to empty string where needed for stable client typing). The endpoint SHALL NOT require query parameters for correctness.

#### Scenario: Successful list response

- **WHEN** a client issues `GET` to the agenda projects list route
- **THEN** the server SHALL respond with status 200 and a JSON array containing every row from `PROYECTOS` needed for the homepage cards
- **AND** the server SHALL execute a single read query for that response body

#### Scenario: Empty table

- **WHEN** `PROYECTOS` contains zero rows
- **THEN** the server SHALL respond with status 200 and an empty JSON array

---

### Requirement: SQL safety and read-only access

The implementation SHALL use **`useDatabase()`** with **parameterized** SQL only (no string-built `WHERE` from user input). The route SHALL be **read-only** (SELECT only).

#### Scenario: No user-controlled SQL fragments

- **WHEN** the endpoint handles a request
- **THEN** it SHALL NOT concatenate untrusted strings into SQL text

---

### Requirement: Stable contract for client filtering

The JSON objects returned SHALL be consumable by the same client-side filtering rules as the former CSV rows: numeric **LE** identity is derived from **`linea`**, grouping uses **`objetivo`**, card title and body use **`nombre`** and **`descripcion`**. Optional columns (e.g. `codigo`) MAY be omitted from the response if unused by the homepage component.

#### Scenario: Field names match UI helpers

- **WHEN** the client receives the array
- **THEN** each element SHALL expose `linea`, `objetivo`, `nombre`, and `descripcion` keys compatible with existing agenda project row helpers
