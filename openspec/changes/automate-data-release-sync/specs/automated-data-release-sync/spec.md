## ADDED Requirements

### Requirement: Cross-repository release dispatch
The system SHALL start the web repository synchronization workflow when the data repository publishes a new release through a trusted cross-repository dispatch event.

#### Scenario: Valid release dispatch starts sync
- **WHEN** `observatorio-tarragona-datos` sends the configured dispatch event to `observatorio-tarragona-web`
- **THEN** the synchronization workflow starts automatically in the web repository

#### Scenario: Invalid event is ignored
- **WHEN** an event that does not match the configured event type is received
- **THEN** the synchronization workflow does not execute data update steps

### Requirement: Release artifacts are downloaded and validated
The synchronization workflow SHALL download `diputacion_tarragona.db` and `latest-data.zip` from the configured release URLs and MUST fail before copy steps if either artifact is missing or invalid.

#### Scenario: Both artifacts are available
- **WHEN** the workflow reaches the download phase and both URLs return valid files
- **THEN** the workflow stores artifacts in temporary workspace and proceeds to extraction/copy

#### Scenario: Artifact download fails
- **WHEN** one or both release URLs fail or return invalid content
- **THEN** the workflow fails and no target repository paths are updated

### Requirement: Repository paths are synchronized deterministically
The workflow SHALL copy the downloaded database into `assets/dbfile` and SHALL copy the dataset extracted from the source archive into `test/dataset`.

#### Scenario: Successful copy updates both targets
- **WHEN** artifact validation succeeds
- **THEN** `assets/dbfile` contains the latest database and `test/dataset` contains the extracted dataset files

#### Scenario: Dataset structure is unexpected
- **WHEN** the archive does not contain the expected dataset source path
- **THEN** the workflow fails with explicit error output and does not trigger deployment

### Requirement: Tests gate deployment trigger
The workflow MUST run the repository test suite after synchronization and SHALL invoke the configured Netlify hook only when tests pass.

#### Scenario: Tests pass and Netlify hook is called
- **WHEN** synchronization completes and all tests pass
- **THEN** the workflow invokes the Netlify build hook exactly once

#### Scenario: Tests fail and deployment is blocked
- **WHEN** any test fails after synchronization
- **THEN** the workflow does not call the Netlify build hook and exits with failure
