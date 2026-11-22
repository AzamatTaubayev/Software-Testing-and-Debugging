# Software Testing and Debugging

KBTU 2026 · Taubayev Azamat, ID 26MD0347

| Folder | Assignment |
|---|---|
| [`week-4/`](week-4/) | Documentation pack for the money transfer feature |
| [`sis2/`](sis2/) | SIS 2: Playwright end-to-end tests for practicesoftwaretesting.com + CI pipeline |

## CI

[![Playwright Tests](https://github.com/AzamatTaubayev/Software-Testing-and-Debugging/actions/workflows/playwright.yml/badge.svg?branch=main)](https://github.com/AzamatTaubayev/Software-Testing-and-Debugging/actions/workflows/playwright.yml)

**CI system:** GitHub Actions. It is built into GitHub, where the repository already lives, so there is no server to install or maintain. It is free for public repositories, and its job matrix gives sharding out of the box. GitLab CI or Jenkins would mean moving the repository or running and exposing a server of my own.

**Pipeline** ([`.github/workflows/playwright.yml`](.github/workflows/playwright.yml)):

- runs on every push to every branch, on every pull request, and manually (`workflow_dispatch`);
- a newer push to the same branch cancels the outdated run (`concurrency`);
- the Playwright project is in `sis2/`, so every step runs there (`defaults.run.working-directory`);
- the Toolshop app started in Docker for each shard (see below);
- `npm ci` with the npm cache of `actions/setup-node` (keyed on `sis2/package-lock.json`); Chromium installed with system dependencies (`npx playwright install --with-deps chromium`);
- the full suite, no `--grep` or `--project` filters, split into **4 shards** (`--shard=i/4`) running in parallel; `fail-fast: false` so one failed shard does not cancel the others;
- the `Merge reports` job merges the shards' blob reports into one HTML report and one JUnit file, even when tests failed (`if: !cancelled()`);
- artefacts: `playwright-report` (merged HTML), `junit-report` (merged JUnit), `test-results-1…4` (traces, screenshots, videos, per-shard JUnit); kept for **14 days**. The per-shard `blob-report-N` files are intermediate and kept for 1 day.

**CI settings** ([`sis2/playwright.config.ts`](sis2/playwright.config.ts), active when `CI=true`, which GitHub Actions sets automatically): `forbidOnly: true`, `retries: 2`, `workers: 2`, reporters `list` + `blob` + `junit` (`reports/junit.xml`), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`. `fullyParallel: true` lets `--shard` split individual tests instead of whole files: with 5 spec files and 4 shards, splitting by file would leave the shards very uneven.

**What the tests run against in CI:** the public site practicesoftwaretesting.com is behind a Cloudflare bot check ("Performing security verification — Verify you are human"). The first CI runs showed that it blocks GitHub-hosted runners: 4 of 10 tests failed on that page, while all 10 pass on my laptop. Getting around a bot check is not a fix, so every shard starts **its own copy of the Toolshop app** with the authors' prebuilt Docker images ([`sis2/ci/docker-compose.toolshop.yml`](sis2/ci/docker-compose.toolshop.yml)): MariaDB, API, web server and Angular UI. It then seeds the database (`php artisan migrate:refresh --seed`), waits for the API and UI, and runs the tests with `BASE_URL=http://localhost:4200` and `API_URL=http://localhost:8091`. Each shard has a fresh database, so tests do not depend on other people using the shared demo (for example, the product stock running out). Locally the tests still default to the public site. No passwords are needed: every test creates its own user.

### Runtime

| Configuration | Total run time | Run tests step (slowest shard) | Run |
|---|---|---|---|
| 1 job, no sharding | TBD | TBD | [run](TBD) |
| 4 shards + merge | TBD | TBD | [run](TBD) |

Numbers are the median of 3 `workflow_dispatch` runs on GitHub Actions (Actions → Playwright Tests → Run workflow, `shards` = 1 or 4), not from my laptop.
Conclusion: TBD

### Running locally

```bash
cd sis2
npm ci
npx playwright install --with-deps chromium
CI=true npx playwright test
```

Without `CI=true` the same command runs with the local settings (no retries, HTML report that opens on failure).
