## Why

The application currently depends on manual synchronization with the data repository, which delays publishing new validated datasets and increases operational errors. Automating this flow ensures each data release is pulled, validated through tests, and deployed consistently.

## What Changes

- Add a GitHub Actions workflow in the web repository that can be triggered by new releases from the data repository.
- Download the latest release artifacts from `observatorio-tarragona-datos`: SQLite database (`diputacion_tarragona.db`) and source archive (`latest-data.zip`).
- Copy the downloaded database to `assets/dbfile`.
- Extract and copy the dataset from the source archive into `test/dataset`.
- Run the project test suite after syncing artifacts.
- Trigger a Netlify build hook only when synchronization and tests complete successfully.
- Add workflow documentation and required secrets configuration for maintainers.

## Capabilities

### New Capabilities
- `automated-data-release-sync`: Synchronize release artifacts from the data repository into the web repository, validate with tests, and trigger deployment automation.

### Modified Capabilities
- None.

## Impact

- Affected code: `.github/workflows` in `observatorio-tarragona-web`, plus optional helper scripts for download/extract/copy steps.
- External systems: GitHub release events from `observatorio-tarragona-datos`, GitHub-hosted runners, and Netlify build hooks.
- Dependencies: command-line tools available in runners (`curl`, `unzip`, shell utilities) and repository secrets for authenticated event/webhook handling.
- Operational impact: removes manual update steps and standardizes release-to-deploy validation.
