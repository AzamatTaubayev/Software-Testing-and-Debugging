# 1. Test plan: Money transfer with SMS code

Feature: money transfer between accounts with an SMS one-time code for large amounts.
Release: transfer v1 (course example). Author: Taubayev Azamat.

## Requirements under test

| ID | Requirement (from the week 3 brief) |
|---|---|
| REQ-3.1 | Amount: 100 to 500,000 KZT per transfer, whole tenge only. |
| REQ-3.2 | Daily limit: 1,000,000 KZT across all transfers, reset at midnight Almaty time. |
| REQ-3.3 | Transfers above 100,000 KZT require a 6-digit SMS code. The code is valid for 120 seconds. Three wrong attempts cancel the transfer. |
| REQ-3.4 | Insufficient balance. **Not in the brief.** Added here because the behaviour is undefined (see the traceability matrix). |
| REQ-3.5 | If the amount and the daily limit are both violated, the amount error is shown. |

## Scope

**In scope**
- Amount validation (REQ-3.1), including whole-tenge and format checks
- Daily limit and its midnight reset (REQ-3.2)
- SMS code flow: request, correct and wrong codes, 120 s expiry, 3 attempts (REQ-3.3)
- Order of error messages (REQ-3.5)
- iOS app, Android app and web, in Kazakh, Russian and English (pairwise set from week 3)

**Out of scope**
- SMS gateway delivery itself (owned by the telecom team). We only check that the code arrives within 30 s on the test phones.
- Transfers to other banks and in foreign currency
- Performance and load testing (separate plan)
- Fees and commissions (not in the brief)
- Insufficient balance (REQ-3.4) until the analyst defines the behaviour

## Approach

| Area | Technique | Level |
|---|---|---|
| Amount | Equivalence partitions + 3-value boundary values | System, manual |
| Daily limit and error order | Decision table (8 rules collapsed to 4) | System, manual |
| SMS code | State transition, valid-transitions coverage + 3 risky invalid transitions | System, manual |
| Platform × language × account × recipient | Pairwise (PICT, 13 combinations) | System, smoke on each combination |

Regression of the whole transfer flow is run before each release candidate using the SMS release checklist (`04-sms-release-checklist.md`).

## Environment and test data

- Test environment 2 (test env 2), app build from the release branch, server clock in Asia/Almaty (UTC+5).
- Test phones with SIM cards that receive the SMS codes. One per platform.
- Test customers, created by the data script before each run:

| Customer | Balance | Daily total today | Accounts |
|---|---|---|---|
| TC-014 | 1,000,000 KZT | 0 | Current account ending 1102, deposit ending 4417 |
| TC-021 | 1,000,000 KZT | 900,000 (transfers already made today) | Current account ending 2205, deposit ending 5520 |
| TC-022 | 1,000,000 KZT | 950,000 | Current account ending 2206, deposit ending 5521 |
| TC-023 | 1,000,000 KZT | 500,000 | Current account ending 2207, deposit ending 5522 |
| TC-030 | 150,000 KZT | 0 | Current account ending 3310, deposit ending 6630 (used in DEF-001) |
| TC-031 | 2,000,000 KZT | 1,000,000 (limit used up) | Current account ending 3311, deposit ending 7741 (used in DEF-003) |

Getting test customers with a set daily total takes time in a bank. The data script must be ready before testing starts (entry criterion).

## Entry criteria

1. The build is deployed to test env 2, and the build number is recorded.
2. The smoke test passes: login, open Transfers, one transfer of 100 KZT completes.
3. Test customers TC-014, TC-021, TC-022 and TC-023 exist with the balances and daily totals above.
4. The test phones receive an SMS code within 30 s.
5. The analyst has answered questions Q5 and Q7 from week 3 (whether the daily limit is inclusive, and whether it is checked before the SMS is sent). Otherwise TR-DAY-001 and TR-DAY-002 are blocked.

## Exit criteria

1. All 12 test cases in `02-test-cases.md` are executed. Each has the status Passed, Failed or Blocked, with a reason for every Blocked.
2. 0 open defects with severity Critical or High.
3. All 3-value boundary tests on the amount (12 values) passed.
4. Every requirement REQ-3.1, 3.2, 3.3 and 3.5 has at least one passed test. REQ-3.4 is listed as residual risk.
5. The SMS release checklist is fully ticked on iOS, Android and web.
6. Any criterion not met is written down with the reason and accepted in writing by the product owner, with a date.

## Top 3 product risks

| # | Risk | Impact | What we test |
|---|---|---|---|
| 1 | Double debit: Confirm is tapped twice or the network retries the request | Customer loses money; regulatory complaint | TR-OTP-008, checklist item 7 |
| 2 | The SMS code still works after expiry or after 3 wrong attempts | Security bypass; brute force of a 6-digit code | TR-OTP-007, checklist items 4–6 |
| 3 | The daily limit resets at the wrong time (server in UTC, so 05:00 Almaty) | Customers blocked in the morning, or allowed to send 2,000,000 in one Almaty day | Checklist item 10, defect DEF-003 |

**Project risk:** the test data script for daily totals is late, which blocks the TR-DAY tests.
