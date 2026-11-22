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
- `npm ci` with the npm cache of `actions/setup-node` (keyed on `sis2/package-lock.json`); Chromium installed with system dependencies (`npx playwright install --with-deps chromium`);
- the full suite, no `--grep` or `--project` filters, split into **4 shards** (`--shard=i/4`) running in parallel; `fail-fast: false` so one failed shard does not cancel the others;
- the `Merge reports` job merges the shards' blob reports into one HTML report and one JUnit file, even when tests failed (`if: !cancelled()`);
- artefacts: `playwright-report` (merged HTML), `junit-report` (merged JUnit), `test-results-1…4` (traces, screenshots, videos, per-shard JUnit); kept for **14 days**. The per-shard `blob-report-N` files are intermediate and kept for 1 day.

**CI settings** ([`sis2/playwright.config.ts`](sis2/playwright.config.ts), active when `CI=true`, which GitHub Actions sets automatically): `forbidOnly: true`, `retries: 2`, `workers: 2`, reporters `list` + `blob` + `junit` (`reports/junit.xml`), `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, `video: 'retain-on-failure'`. `fullyParallel: true` lets `--shard` split individual tests instead of whole files: with 5 spec files and 4 shards, splitting by file would leave the shards very uneven.

**Base URL:** the tests target an external site. `BASE_URL` can be set under Settings → Secrets and variables → Actions → Variables; if it is not set, the tests use https://practicesoftwaretesting.com. No passwords are needed: every test creates its own user.

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
