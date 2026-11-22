# AI usage: SIS 2 CI pipeline

## Tool and date

- **Tool:** Claude (Anthropic), in the Claude app, agent mode (reads and writes files, runs commands in a sandbox)
- **Model:** Claude Opus 5.5 (`claude-opus-5-5`)
- **Date:** 22 November 2026
- **Attached:** `SIS 2: CI pipeline for Playwright — step-by-step guide` (PDF from the course)

## Prompt (exactly as sent)

```
You are a Senior DevOps & QA Automation Engineer. I need you to set up a complete GitHub Actions CI/CD pipeline for my Playwright Test repository to satisfy all requirements for my "SIS 2: CI pipeline for Playwright" assignment.

Please inspect the current repository first (check `package.json`, `package-lock.json`, `playwright.config.ts`, `.gitignore`, and the `tests/` folder) and then execute the following tasks step-by-step:

### 1. Update `.gitignore`
Ensure the following directories and local testing artifacts are ignored:
- `node_modules/`
- `test-results/`
- `playwright-report/`
- `blob-report/`
- `reports/`
- `all-blob-reports/`
- `.act-artifacts/`
- `.secrets`

### 2. Configure Playwright for CI (`playwright.config.ts` & `merge.config.ts`)
- **Update `playwright.config.ts`:** Preserve my existing `testDir`, `projects`, `baseURL` (falling back to `process.env.BASE_URL`), and `webServer` settings (if present, set `reuseExistingServer: !isCI`), while adding CI-specific behavior toggled by `const isCI = !!process.env.CI;`:
  - `fullyParallel: true` (so `--shard` splits individual tests evenly across 4 shards rather than by file)
  - `forbidOnly: isCI`
  - `retries: isCI ? 2 : 0`
  - `workers: isCI ? 2 : undefined`
  - `reporter`: When `isCI` is true, use `[['list'], ['blob'], ['junit', { outputFile: 'reports/junit.xml' }]]`. Otherwise, use `[['list'], ['html', { open: 'on-failure' }]]`.
  - Under `use`: `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`.
- **Create `merge.config.ts` in the repository root:**
  Configure it to merge shard blob reports into both an HTML report (`['html', { open: 'never' }]`) and a merged JUnit XML (`['junit', { outputFile: 'reports/junit-merged.xml' }]`).

### 3. Create GitHub Actions Workflow (`.github/workflows/playwright.yml`)
Create `.github/workflows/playwright.yml` named `Playwright Tests` with:
- **Triggers:** `push` (all branches), `pull_request` (all branches), and `workflow_dispatch`.
- **Concurrency:** Group by `${{ github.workflow }}-${{ github.ref }}` with `cancel-in-progress: true`.
- **Job 1 (`test`):**
  - Matrix strategy: `fail-fast: false`, `shardIndex: [1, 2, 3, 4]`, `shardTotal: [4]`.
  - Runs on `ubuntu-latest`, `timeout-minutes: 30`.
  - Steps:
    1. `actions/checkout@v4`
    2. `actions/setup-node@v4` (Node 22, `cache: 'npm'`)
    3. `npm ci`
    4. `npx playwright install --with-deps chromium`
    5. `npx playwright test --shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}` (passing `BASE_URL: ${{ vars.BASE_URL }}` in `env` if applicable, without any `--grep` or `--project` filters).
    6. Upload `blob-report` as artifact `blob-report-${{ matrix.shardIndex }}` (`if: ${{ !cancelled() }}`, `retention-days: 1`).
    7. Upload `test-results/` and `reports/` as artifact `test-results-${{ matrix.shardIndex }}` (`if: ${{ !cancelled() }}`, `retention-days: 14`).
- **Job 2 (`merge-reports`):**
  - `needs: [test]`, `if: ${{ !cancelled() }}`, `runs-on: ubuntu-latest`.
  - Steps: checkout, setup-node (Node 22, `cache: 'npm'`), `npm ci`, `actions/download-artifact@v4` (`path: all-blob-reports`, `pattern: blob-report-*`, `merge-multiple: true`), run `npx playwright merge-reports --config merge.config.ts ./all-blob-reports`, upload `playwright-report` (`retention-days: 14`), and upload `reports/junit-merged.xml` as `junit-report` (`retention-days: 14`).

### 4. Update `README.md`
Add a `## CI` section to `README.md` (detect the `<owner>/<repo>` from `git remote -v` to auto-fill the GitHub badge URL):
- Status badge: `[![Playwright Tests](https://github.com/<owner>/<repo>/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/<owner>/<repo>/actions/workflows/playwright.yml)`
- Clear explanation stating why **GitHub Actions** was chosen (built into GitHub where the repo lives, zero server maintenance, free for public repos, native matrix sharding).
- Overview of the pipeline triggers, caching, 4-shard parallelism, report merging, 14-day artifact retention, and `CI=true` Playwright settings.
- A **Runtime** Markdown table ready for my GitHub Actions benchmark numbers:
  - Row 1: `1 job, no sharding` | `TBD` | `TBD` | `[run](TBD)`
  - Row 2: `4 shards + merge` | `TBD` | `TBD` | `[run](TBD)`
  - Include a note underneath explaining that these will be populated using the median of 3 `workflow_dispatch` runs on GitHub Actions, plus a placeholder for the one-sentence conclusion.
- A **Running locally** subsection with the exact commands (`npm ci`, `npx playwright install --with-deps chromium`, `CI=true npx playwright test`).

### 5. Local Verification
If you have terminal access, run local checks to verify everything works before I push:
1. Run `CI=true npx playwright test --shard=1/2` and `CI=true npx playwright test --shard=2/2` (copying the zip outputs to `all-blob-reports/`) and verify `npx playwright merge-reports --config merge.config.ts ./all-blob-reports` generates both `playwright-report/` and `reports/junit-merged.xml`.
2. Temporarily test `forbidOnly` by checking that a `.only` test fails when `CI=true`, then revert it cleanly.

### 6. Create AI Usage Documentation (`AI_USAGE.md`)
Because this assignment strictly requires an `.md` file documenting AI usage, create `AI_USAGE.md` in the root directory containing:
- The AI model used (Claude) and date.
- The exact prompt(s) used to generate the solution.
- A detailed file-by-file explanation of what was generated/modified (`playwright.config.ts`, `merge.config.ts`, `.github/workflows/playwright.yml`, `.gitignore`, `README.md`) and why each CI flag (`forbidOnly`, `retries`, `blob` reporter, `junit` reporter, `fullyParallel`, `fail-fast: false`, `!cancelled()`) was configured that way.
- Manual steps remaining for me to complete on GitHub (pushing to a feature branch, opening a PR, verifying the `forbidOnly` failure run, running the 1-shard vs. 4-shard timing benchmarks via `workflow_dispatch`, and merging to `main` so the badge activates).```

## What was generated or changed, file by file

### `sis2/playwright.config.ts` (changed)

Kept: `testDir`, the `chromium` project, `testIdAttribute: 'data-test'`, the 60 s test timeout and 10 s expect timeout. There is no `webServer`, because the tests target an external site.

Added, all switched by `const isCI = !!process.env.CI` (GitHub Actions sets `CI=true` itself):

| Setting | Value in CI | Why |
|---|---|---|
| `fullyParallel` | `true` | `--shard` then splits individual tests. Without it, sharding is by file: 5 spec files over 4 shards would be very uneven. |
| `forbidOnly` | `true` | A forgotten `test.only` would silently run one test and CI would stay green. Now the run fails with an error. |
| `retries` | `2` | A test that fails once and then passes is reported as *flaky* instead of red. The suite runs against a shared public server, so this matters. |
| `workers` | `2` | GitHub-hosted runners have 2–4 vCPUs. |
| `blob` reporter | on | Each shard writes its own blob; the merge job turns them into one HTML report. |
| `junit` reporter | `reports/junit.xml` | XML that CI tools and test-report actions understand. |
| `trace` | `on-first-retry` | A trace of exactly the attempt that failed, without recording every passing test. |
| `screenshot` / `video` | `only-on-failure` / `retain-on-failure` | Evidence for failures only, so artefacts stay small. |

Locally (no `CI`) it stays as before: no retries, `list` + `html` reporter that opens on failure.

**Change I made that the prompt did not ask for:** `baseURL` now uses `process.env.BASE_URL || '…'` instead of `??`. In GitHub Actions, `BASE_URL: ${{ vars.BASE_URL }}` gives an **empty string** when the repository variable is not set, and `'' ?? default` is `''`. Every test would then open a relative URL with no host. The same fix was applied to `API_URL` in `fixtures/pages.fixture.ts`.

### `sis2/merge.config.ts` (new)

Used only by `npx playwright merge-reports`. It merges the shards' blob reports into one HTML report (`open: 'never'`, because there is nobody to open it on a runner) and one JUnit file, `reports/junit-merged.xml`.

### `.github/workflows/playwright.yml` (new, repository root)

| Part | Why |
|---|---|
| `on: push`, `pull_request` with no branch filter | Requirement 1: runs for every feature branch and every PR. |
| `workflow_dispatch` with a `shards` input (`4` or `1`) | Manual runs for the timing benchmark. |
| `concurrency` with `cancel-in-progress` | A newer push to the same branch cancels the outdated run. |
| `defaults.run.working-directory: sis2` | **Not in the prompt.** The prompt assumes the Playwright project is the repository root, but in this course repository it is in `sis2/` (next to `week-4/`). GitHub only reads workflows from the root `.github/workflows/`, so the workflow stays there and every `run` step works inside `sis2/`. For the same reason the artefact paths start with `sis2/` and `setup-node` gets `cache-dependency-path: sis2/package-lock.json`. Without that, the npm cache would look for a lock file in the root and fail. |
| `fail-fast: false` | One failed shard does not cancel the other three. |
| matrix `shardIndex [1,2,3,4]`, `shardTotal [4]` | Requirement 5: 4 parallel jobs. **Changed from the prompt:** when the workflow is started by hand with `shards = 1`, the matrix becomes `[1]` / `[1]`. The guide suggests editing the matrix and pushing twice for the before/after timing. The input gives the same "1 job, no sharding" run without changing the file, and push/PR runs are always 4 shards. |
| `setup-node` with `cache: npm` + `npm ci` | Requirement 2: cached dependencies; `npm ci` installs exactly the lock file. |
| `npx playwright install --with-deps chromium` | Browser plus Linux system libraries. Browsers are not cached: the Playwright docs say restoring them takes about as long as downloading. |
| `npx playwright test --shard=i/n` without `--grep` / `--project` | The full suite. |
| `if: ${{ !cancelled() }}` on uploads and on the merge job | Reports and traces are uploaded even when tests fail, which is exactly when they are needed. |
| artefacts `test-results-N` + `playwright-report` + `junit-report`, `retention-days: 14` | Requirement 3: report and traces kept for at least 7 days. `blob-report-N` only 1 day, because it is an intermediate file. |

### `sis2/package.json` (changed)

`@playwright/test` pinned to `1.64.1` (was `^1.48.0`), the version already in `package-lock.json`. The guide asks for a pinned version, so a new Playwright release cannot change CI behaviour on its own.

### `sis2/.gitignore` (changed)

Added `reports/`, `all-blob-reports/`, `.act-artifacts/` and `.secrets` to the existing `node_modules/`, `test-results/`, `playwright-report/` and `blob-report/`.

### `README.md` (new, repository root) and `sis2/README.md` (changed)

The front page of the repository shows the root README, so the badge and the full `## CI` section are there: the CI system and why, the pipeline, the CI settings, the runtime table and how to run locally. `sis2/README.md` got a short `## CI` section with the badge and links.

## Local verification (done by the AI in its sandbox)

The sandbox could not reach practicesoftwaretesting.com (blocked by its network rules), so the tests themselves failed there. The CI mechanics could still be checked:

1. `CI=true npx playwright test --shard=1/2` and `--shard=2/2` produced `blob-report/report-1.zip` and `report-2.zip` and `reports/junit.xml`.
2. `npx playwright merge-reports --config merge.config.ts ./all-blob-reports` produced `playwright-report/index.html` and `reports/junit-merged.xml` with `tests="10"`: all 10 tests from both shards.
3. `forbidOnly`: one `test(` changed to `test.only(`. With `CI=true` Playwright stopped with *"item focused with '.only' is not allowed due to the 'forbidOnly' option"*. The change was reverted, and `git diff` was empty afterwards.
4. The workflow YAML parses, with jobs `test` and `merge-reports`.

The real proof is a green run on GitHub. That run, and the timing numbers, are done by me (see below).

## First CI runs: what failed and what was changed

The first two runs (push and PR) had the right structure: 4 shards, Merge reports and all artefacts. But shards 1–3 were red. The merged JUnit showed 4 failing tests, and the `error-context.md` and screenshots from `test-results-1…3` showed why: on the GitHub runner the site answered with a **Cloudflare page "Performing security verification — Verify you are human"** instead of the app. The public demo blocks data-centre IP addresses such as GitHub's. Another test (TC-03) found Combination Pliers out of stock on the shared demo, so the "+" button was disabled (`[disabled]="!product.in_stock"` in the app source).

Getting around a bot check is not acceptable, so the fix was to stop depending on the shared public site in CI:

- **`sis2/ci/docker-compose.toolshop.yml` (new):** a copy of the authors' `docker-compose.prod.yml` (github.com/testsmith-io/practice-software-testing) with their prebuilt images: MariaDB, `sprint5-api`, `web`, `sprint5-ui`. The authors run their own Playwright CI the same way.
- **Workflow:** each shard starts the app, seeds the database, waits for `http://localhost:8091/status` and `http://localhost:4200`, and runs the tests with `BASE_URL`/`API_URL` pointing to localhost. On failure it prints the app logs.
- **`fixtures/pages.fixture.ts`:** if an app build has no postcode lookup, the default address is kept instead of failing.

**Second attempt also failed**, in the step "Wait for API and UI": the API on `localhost:8091` never answered (curl exit code 7). The log of "Start Toolshop app (Docker)" showed why: *"web: The requested image's platform (linux/arm64) does not match the detected host platform (linux/amd64)"*. The authors' `testsmith/practice-software-testing-web` image is built for ARM only. Its Dockerfile is just `nginx:alpine` plus `vhost.conf`, so it was replaced with the official multi-platform `nginx:1.27-alpine` and the authors' config, copied to `sis2/ci/nginx-toolshop.conf`. The workflow now also checks that the seeded API returns "Combination Pliers" before the tests start, so a broken app setup fails early with a clear message.

## Steps done on GitHub (by me)

1. Pushed the branch `ci/playwright-pipeline` and opened [PR #1](https://github.com/AzamatTaubayev/Software-Testing-and-Debugging/pull/1). The first runs for push and PR were red, so I sent the AI the failing logs, the JUnit report and the `test-results` artefacts. Two fixes followed (see above), after which all 10 checks were green, and I merged the PR into `main`.
2. `forbidOnly` evidence: branch `ci/forbid-only-demo` with one `test(` changed to `test.only(`. [Its run](https://github.com/AzamatTaubayev/Software-Testing-and-Debugging/actions/runs/45037685458) failed in all 4 shards on the forbidden `.only`. The branch was not merged.
3. Timing: 3 manual runs with `shards = 1` and 3 with `shards = 4` on `main` (plus one extra 1-shard run, #10, with the same 1m 26s). The AI read the step timings from the public run pages and filled the Runtime table in `README.md`.

## What I checked myself

- I reviewed the failing CI runs: the Docker start log (which showed the arm64-only `web` image) and the shard 1 log, and I downloaded the JUnit report and the `test-results` artefacts so the cause could be found.
- I checked that the PR run, after the fixes, had all 10 checks green before merging, and that the `test.only` run is red.
- I ran the timing benchmark one run at a time, so concurrency did not cancel any run.
