# Review of the AI output

## What the AI produced

- A Playwright + TypeScript project with the structure from the lecture (slide 20): 5 spec files, 7 page objects, 1 fixture file, 1 data factory, `playwright.config.ts`.
- 9 tests covering the 5 test cases from slide 28 (register, log in, buy a product, compare two products, reset a password), with negative cases for register, login and reset.
- README.md and Description.md.

## How the AI worked, and what that means for the review

The AI could not open practicesoftwaretesting.com from its sandbox (the site was blocked by its network rules). Instead of guessing selectors, it read the app's open-source code (github.com/testsmith-io/practice-software-testing, `sprint5`) and took the `data-test` names, routes, error texts and API rules from there. It checked that the project compiles (`tsc`) and that Playwright finds all 9 tests (`npx playwright test --list`), but **it did not run the tests against the live site**.

After that, at my request, the AI opened the live site in the browser on my computer and checked it against the code: the `data-test` names on the register and product pages match, Kazakhstan (`KZ`) is in the country list, the API returns 201 for a new registration, 409 "A customer with this email address already exists." for a duplicate, 422 "The selected email is invalid." for a password reset on an unknown email, and the prices are Combination Pliers 14.15 and Bolt Cutters 48.41 (so the TC-04 comparison holds). The first real run was mine, on my laptop. That is why the run results below matter.

## What I checked

| Course rule (slides 29–30) | Result |
|---|---|
| Runs from a clean clone with `npm install` + `npx playwright test` | See run results below |
| Page objects used by the specs | Yes, all actions go through `pages/` |
| No locator in any spec file | Checked: specs only use page objects and `page` for URL assertions |
| At least one fixture | `fixtures/pages.fixture.ts`: page objects + `registeredUser` |
| Unique data per run | `data/user.factory.ts` builds a random email and password every call |
| Every test has an assertion that could fail | Yes, each test asserts a URL, a text, a count or a value |
| No `waitForTimeout` | Searched the project: none |
| No CSS classes or positional XPath | Only `getByTestId`, `getByRole`, `getByText` |
| Independent, any order, parallel | `fullyParallel: true`; every test creates its own user; no shared state |

## Decisions I agree with, and why

1. **No seeded accounts.** The AI found in the API source that a password reset sets the password to `welcome02` for any account. If someone resets `customer@practicesoftwaretesting.com`, every suite that logs in with `welcome01` breaks. A fresh account per test, created through the API, avoids that. I kept this.
2. **TC-05 also checks the new password works.** A confirmation banner alone could be shown even if nothing happened. Logging in with `welcome02` proves the reset really changed the password.
3. **Products found by name, not id.** Ids change when the demo database is reseeded.
4. **TC-04 states the comparison first** ("Bolt Cutters cost more than Combination Pliers") and asserts it, as the brief asks, instead of only printing the prices.

## Changes after running the tests

First run on my laptop: **8 passed, 1 failed** (TC-05, known email). The screenshot showed the forgot-password form with no confirmation.

How I found the cause: I asked the AI to repeat the steps in the browser. The API worked (200 `{"success":true}`, and `welcome02` signed in), but the success banner on the page showed the raw text `page.forgot-password.confirm` for 3 seconds instead of "Your password is successfully updated!". In the app source the template uses the key `page.forgot-password.confirm`, while the English translation file defines `pages.forgot-password.confirm`. So this is a **real defect in the application**, and the test was right to fail.

| ID | Title | Severity | Priority |
|---|---|---|---|
| DEF-SIS2-01 | Forgot password: the success banner shows the translation key "page.forgot-password.confirm" instead of the message | Low (the reset works) | Medium (every user sees it) |

What I changed and why:

1. The main TC-05 test no longer depends on the banner text. It checks the API response (200, `{"success":true}`), that a non-error banner appears, that no error appears, and that the new password works. That is what "the reset works" really means.
2. I added a separate test, "the confirmation shows a readable message", marked `test.fail()` with the defect id. It documents the bug, keeps the suite green, and Playwright will report it as soon as the developers fix the key.
3. The negative test now also checks the API status (422) and the exact error text "The selected email is invalid.".
4. The malformed-email case got its own page-object method, because no request is sent for it and waiting for a response would hang.

Second run: the reset tests passed (9 passed + 1 expected failure), but **TC-03 Buy a product failed**, although it had passed in the first run. The screenshot showed "Payment was successful" and the "Confirm" button, but no order confirmation after 10 seconds. In the app code the same button first checks the payment and then creates the invoice with a separate request (`POST /invoices`). On the shared public server that request can be slow, and the second click could also land before the button had changed to "Confirm".

What I changed: `confirmOrder()` now clicks the button only when it says "Confirm", waits up to 30 s for the `POST /invoices` response and returns it. The test asserts that the invoice was created (201) before it checks the confirmation text. If it fails again, the error now says whether the server failed or the page did not update. I did not add `waitForTimeout` or retries for this.

Third run: TC-03 failed again, now with a clear message: **`POST /invoices` returned 422**. That is the benefit of the previous change. Reading the API source showed why: the demo server fills addresses from a *fake* postcode lookup (Faker). For KZ 050010 it returns "West Erlingchester, Alabama". When the invoice is created, the server checks that the city and state match that lookup, and "Almaty" does not. In the first run the test passed only by luck: the page itself patched the form with the lookup values just before the click. So the AI's original assumption ("KZ has no postcode lookup") was wrong.

What I changed: a new fixture `newUser` asks `GET /postcode-lookup` for the address first and uses its street, city and state. `registeredUser` and the registration test use it. Now the address always matches, no matter when the page patches the form. This removes the race instead of hiding it.

Final run: see `screenshots/run-results.png`.

## Screenshots

- `screenshots/ai-response.png`: the AI's answer in the Claude app
- `screenshots/run-results.png`: terminal output of `npx playwright test`
- `screenshots/html-report.png`: Playwright HTML report
