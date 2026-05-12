## 1. Cross-repository trigger setup

- [x] 1.1 Create a release workflow in `observatorio-tarragona-datos` that sends `repository_dispatch` to `observatorio-tarragona-web` on new release publication.
- [x] 1.2 Define and document the dispatch event type and payload contract (for example `data_release_published` with release metadata).
- [ ] 1.3 Configure and verify the dispatch token secret with least-privilege permissions in the data repository.

## 2. Web repository synchronization workflow

- [x] 2.1 Add a workflow in `observatorio-tarragona-web/.github/workflows` that listens to the dispatch event and runs on GitHub-hosted runners.
- [x] 2.2 Implement download steps for `diputacion_tarragona.db` and `latest-data.zip` using the stable release URLs.
- [x] 2.3 Add artifact validation checks (HTTP status, file existence, expected archive structure) and fail fast on invalid inputs.
- [x] 2.4 Implement copy/update steps to place the database in `assets/dbfile` and extracted dataset files in `test/dataset`.

## 3. Test gate and deployment hook

- [x] 3.1 Configure the workflow to run the canonical CI test command after file synchronization.
- [x] 3.2 Add conditional Netlify hook invocation that runs only when all prior steps, including tests, succeed.
- [x] 3.3 Add retry/timeout handling for the Netlify hook call and ensure failures are visible in workflow logs.

## 4. Security, documentation, and operational validation

- [x] 4.1 Add or update docs describing required secrets (`WEB_REPO_DISPATCH_TOKEN`, `NETLIFY_BUILD_HOOK_URL`), event flow, and troubleshooting steps.
- [ ] 4.2 Validate end-to-end behavior with a dry run: trigger dispatch, verify downloads/copies, confirm tests run, and confirm Netlify hook behavior on pass/fail.
- [x] 4.3 Add guardrails in workflow logs/output to make root-cause diagnosis clear when artifact paths or release contracts change.
