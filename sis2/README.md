# SIS 2: Test automation with Playwright

End-to-end tests for the Toolshop demo app, https://practicesoftwaretesting.com, written in TypeScript with Playwright.

Taubayev Azamat, ID 26MD0347 · Software Testing and Debugging, KBTU 2026

## How to run

```bash
npm install
npx playwright install chromium
npx playwright test            # all tests, in parallel
npx playwright show-report     # HTML report
```

Run the same suite against the deliberately buggy build:

```bash
npm run test:bugs
```

## What is covered

| # | Test case | Spec | What it proves |
|---|---|---|---|
| TC-01 | Register a new customer | `tests/register.spec.ts` | A new account with a unique email is created and can sign in. A duplicate email is rejected. |
| TC-02 | Log in | `tests/login.spec.ts` | Valid credentials open My account. A wrong password shows "Invalid email or password" and stays on the login page. |
| TC-03 | Buy a product | `tests/buy-product.spec.ts` | 2 × Combination Pliers: header cart count is 2, the cart shows the right item and quantity, checkout ends with an invoice number. |
| TC-04 | Compare two products | `tests/compare-products.spec.ts` | Captures name and price of Combination Pliers and Bolt Cutters; asserts Bolt Cutters cost more. |
| TC-05 | Reset a password | `tests/reset-password.spec.ts` | A known email gets a success response and banner, and the new password works; an unknown email and a malformed email get errors. One test is marked `test.fail()` for a real defect (see Review.md). |

10 tests in 5 files (one is an expected failure that documents a real defect). Details are in [Description.md](Description.md).

## Structure

```
tests/      one spec per test case, no locators in specs
pages/      one page object per screen (base, login, register, forgot-password, product, cart, checkout)
fixtures/   pages.fixture.ts: hands page objects to every test + creates a fresh user through the API
data/       user.factory.ts: unique user per run, product names
```

## Decisions

- **`testIdAttribute: 'data-test'`**: the app marks elements with `data-test`, so `getByTestId` works everywhere. The names were taken from the app's Angular templates (github.com/testsmith-io/practice-software-testing, `sprint5/UI`), not from a tutorial.
- **A fresh account for every test, never the seeded `customer@` accounts.** The demo's password reset changes the password of whatever account it is run on to `welcome02`. Other students run their reset test on the seeded accounts, so a suite that logs in with `customer@…/welcome01` can break at any moment. The `registeredUser` fixture creates its own customer through `POST /users/register` before each test that needs one.
- **Registration through the API in the fixture, through the UI only in TC-01.** TC-01 is the one test whose subject is the registration form.
- **Products are found by name through search, never by id.** Product ids are ULIDs and change when the database is reseeded.
- **No `waitForTimeout`, no CSS classes, no XPath.** Only web-first assertions and `getByTestId`/`getByRole`/`getByText`.
- **Independent and parallel.** `fullyParallel: true`; no test depends on another or on shared data.
- **Retries and traces only in CI** (`retries: process.env.CI ? 2 : 0`, `trace: 'on-first-retry'`).

## What is not automated, and why

- Payment methods other than cash on delivery (bank transfer, credit card, gift card, buy now pay later): same checkout path, different form. Worth a data-driven test later.
- Two-factor login (TOTP): needs a seeded secret.
- The built-in "compare" page: TC-04 compares through the product pages as the brief asks.
- Visual layout and languages other than English.

## AI use (Level 1)

See [Prompt.md](Prompt.md) and [Review.md](Review.md). Screenshots are in `screenshots/`.
