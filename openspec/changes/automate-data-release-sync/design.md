## Context

The web repository (`smartandcity-dip-tarra/observatorio-tarragona-web`) must stay aligned with releases produced by the data repository (`smartandcity-dip-tarra/observatorio-tarragona-datos`). Today this update is manual: developers download release assets, replace files in the web repo, run tests, and trigger deployment. This process is slow and error-prone.

The data repository publishes two stable release endpoints:
- Database binary: `https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/releases/download/latest-data/diputacion_tarragona.db`
- Source archive: `https://github.com/smartandcity-dip-tarra/observatorio-tarragona-datos/archive/refs/tags/latest-data.zip`

The target automation must run in the web repository, update `server/assets/dbfile` and `test/dataset`, validate with tests, and call a Netlify build hook only after success.

## Goals / Non-Goals

**Goals:**
- Trigger a workflow in the web repo when a new data release is published.
- Download and validate release artifacts before replacing local files.
- Keep repository paths deterministic: database in `server/assets/dbfile`, dataset in `test/dataset`.
- Run project tests as a release gate.
- Trigger Netlify deploy hook only when sync and tests succeed.
- Keep failures observable through GitHub Actions logs and explicit step failures.

**Non-Goals:**
- Redesign the transform pipeline in the data repository.
- Change the data model or database schema.
- Introduce auto-merge or auto-commit behavior without explicit governance.
- Replace Netlify deployment architecture beyond invoking the existing build hook.

## Decisions

1. **Cross-repository event trigger via `repository_dispatch`**
   - The data repository will call GitHub API `repository_dispatch` on `smartandcity-dip-tarra/observatorio-tarragona-web` after release publication.
   - The web repository workflow listens to `repository_dispatch` with a custom event type (for example `data_release_published`).
   - Rationale: GitHub Actions cannot natively subscribe to release events from another repository. `repository_dispatch` is explicit, auditable, and easy to secure with a scoped token.
   - Alternatives considered:
     - Scheduled polling: simpler setup but slower propagation and unnecessary runs.
     - Manual workflow dispatch: reliable but keeps a manual operational bottleneck.

2. **Artifact download through fixed `latest-data` URLs**
   - Use the documented stable URLs for DB and ZIP from the release tag alias.
   - Validate HTTP status and file presence before file replacement.
   - Rationale: avoids release API parsing complexity and matches current release contract from data team.
   - Alternative considered: query latest release via GitHub API. Rejected to reduce API dependency and parsing logic.

3. **Two-step staging before copy to tracked directories**
   - Download into a temporary workspace (`mktemp`), unzip, validate expected dataset directory structure, then copy to target paths.
   - `server/assets/dbfile/diputacion_tarragona.db` gets replaced atomically.
   - `test/dataset` is refreshed from archive dataset contents.
   - Rationale: avoids partial updates in case of corrupt downloads.

4. **Test-gated deploy hook invocation**
   - Run project test command after copy operations.
   - Netlify hook call is a final conditional step (`if: success()`).
   - Rationale: ensures deployment is only triggered from validated repository state.
   - Alternative considered: trigger Netlify first and rely on runtime checks. Rejected due to higher rollback cost.

5. **Secrets and permissions**
   - Web repository stores `NETLIFY_BUILD_HOOK_URL`.
   - Data repository stores `WEB_REPO_DISPATCH_TOKEN` with minimal rights to dispatch event to web repo.
   - Workflow permissions use least privilege (`contents: read` unless additional writes are explicitly required).

## Risks / Trade-offs

- **Cross-repo trigger token leakage** → Use GitHub secrets only, short-lived fine-grained token, and secret rotation policy.
- **`latest-data` tag temporarily inconsistent** → Validate downloaded files and fail fast before copy; do not trigger deploy on failure.
- **Archive structure drift in data repo** → Add explicit path checks in workflow, with clear error logs for maintainers.
- **Large dataset copy time increases CI duration** → Accept longer run as trade-off for correctness; optimize later with caching if needed.
- **Netlify hook transient errors** → Retry once with bounded timeout; fail workflow for visibility.

## Migration Plan

1. Add dispatch sender workflow in `observatorio-tarragona-datos` release pipeline (or release hook step).
2. Add receiver/sync workflow in `observatorio-tarragona-web` under `.github/workflows`.
3. Configure required secrets in both repositories.
4. Dry-run with a manual `repository_dispatch` event payload.
5. Validate files are updated in expected paths and tests execute correctly.
6. Validate Netlify hook is called only on successful test runs.
7. Document operating procedure and failure handling.

Rollback:
- Disable workflow files (or skip via `if: false`) in either repo.
- Revert workflow commit if automation causes incorrect updates.
- Keep manual release sync as fallback path.

## Open Questions

- Which exact test command should be used in the web repo (`pnpm test`, `pnpm test:ci`, or equivalent)?
- Should the workflow create a commit/PR automatically after file sync, or only validate and trigger deployment from artifact state?
- Is the dataset root inside `latest-data.zip` always stable, or should extraction logic support multiple known layouts?
