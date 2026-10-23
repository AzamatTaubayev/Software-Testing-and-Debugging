# Description

## What I want to do

Automate five end-to-end scenarios from the SIS 2 brief on the Toolshop demo application (https://practicesoftwaretesting.com) with Playwright and TypeScript. The suite must run from a clean clone with `npm install` and `npx playwright test`, use page objects and fixtures, generate unique data per run, and contain only assertions that can fail.

## Test cases to be automated

| ID | Title | Preconditions | Steps | Expected result |
|---|---|---|---|---|
| TC-01a | Register a new customer | None | Open /auth/register; fill all fields with a unique email; submit; sign in with the new credentials | Redirect to /auth/login; after sign-in the URL is /account and the title is "My account" |
| TC-01b | Duplicate email is rejected | A customer already exists (created through the API) | Register again with the same email | Error containing "already exists"; user stays on /auth/register |
| TC-02a | Log in with valid credentials | Fresh customer created through the API | Open /auth/login; enter email and password; submit | URL /account; title "My account" |
| TC-02b | Log in with a wrong password | Fresh customer created through the API | Enter the right email and a wrong password; submit | "Invalid email or password"; URL stays /auth/login |
| TC-03 | Buy a product | Fresh customer created through the API | Search "Combination Pliers"; open it; increase quantity to 2; add to cart; open cart; proceed; sign in; fill address; cash on delivery; confirm | Header cart count 2; cart has 1 line "Combination Pliers" with quantity 2; payment success message; "Thanks for your order" with an INV- number |
| TC-04 | Compare two products | None | Open Combination Pliers, capture name and price; open Bolt Cutters, capture name and price | Names match the products opened; both prices > 0; Bolt Cutters price > Combination Pliers price |
| TC-05a | Reset password for a known email | Fresh customer created through the API | Open /auth/forgot-password; enter the email; submit; sign in with the new password welcome02 | Success confirmation; no error; sign-in reaches /account |
| TC-05d | Confirmation text is readable | Fresh customer | Request a reset for a known email | Banner says "Your password is successfully updated!" (currently fails: DEF-SIS2-01, marked test.fail) |
| TC-05b | Reset password for an unknown email | None | Enter an email that was never registered; submit | Error banner ("…invalid"); no confirmation |
| TC-05c | Reset password with a malformed email | None | Enter "not-an-email"; submit | Field error under the email; no confirmation |

## Out of scope

Other payment methods, two-factor login, the admin area, the built-in compare page, visual and language checks.
