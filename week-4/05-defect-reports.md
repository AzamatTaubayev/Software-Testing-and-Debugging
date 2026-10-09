# 5. Defect reports

**These three reports are mock-ups.** There is no real build of the transfer feature, so they were designed from gaps in the requirements (the task allows this). The environment, build numbers, request IDs and observed results are example values, not real observations.

---

## DEF-001 · Transfers: SMS code is sent and confirmed for an amount above the balance, then a generic error is shown

| Field | Value |
|---|---|
| Environment | iOS 18.2, app 4.11.0 build 2291, test env 2 |
| Preconditions | Test customer TC-030 logged in; current account balance 150,000 KZT; daily total 0; test phone on hand |
| Reproducibility | 5 of 5 attempts |
| Severity | Medium (no money is lost, but the flow is confusing and wastes an SMS) |
| Priority | High (proposed; to be decided by the product owner: customers will call support) |
| Traces to | REQ-3.4 (not defined in the brief), test design week 3 Q1 |
| Status | New, unassigned |

**Steps to reproduce**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 6630.
3. Enter 200000 and tap Continue.
4. Enter the correct code from the SMS and tap Confirm.

**Expected result**
The brief does not define this case (REQ-3.4). Proposed: after step 3, an "insufficient funds" error is shown and no SMS code is sent.

**Actual result**
After step 3 the SMS code screen opens and an SMS arrives. After step 4 the message "Something went wrong. Try again later." is shown. Balance is still 150,000. The reason (insufficient funds) is not shown anywhere.

**Evidence needed:** screen recording of steps 3–4, request ID of the Confirm call.

---

## DEF-002 · Transfers: transfer above 100,000 KZT executes when a correct SMS code is entered after the 120 s expiry

| Field | Value |
|---|---|
| Environment | Android 14, Pixel 7, app 4.11.0 build 2291, test env 2 |
| Preconditions | Test customer TC-014 logged in; balance 1,000,000 KZT; daily total 0; test phone on hand; a stopwatch |
| Reproducibility | 3 of 3 attempts |
| Severity | Critical (security control does not work) |
| Priority | High (proposed) |
| Traces to | REQ-3.3 / TR-OTP-010 (week 3, invalid transition Expired + correct code) |
| Status | New, unassigned |

**Steps to reproduce**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 300000 and tap Continue. Start the stopwatch when the SMS code screen appears.
4. Wait until the stopwatch shows 130 seconds.
5. Enter the code from the SMS and tap Confirm.

**Expected result**
The code is valid for 120 seconds (REQ-3.3). At 130 s the code is rejected, the transfer is cancelled, and the balance stays 1,000,000.

**Actual result**
The code screen is still open at 130 s with no expiry message. After Confirm the success screen is shown. Balance shows 700,000 and the deposit shows +300,000.

**Evidence needed:** screen recording with the stopwatch visible, request ID of the Confirm call, server log of the code validation.

---

## DEF-003 · Transfers: daily limit resets at 05:00 Almaty time instead of midnight

| Field | Value |
|---|---|
| Environment | Web, Chrome 129, test env 2 (server clock can be set with the environment time tool) |
| Preconditions | Test customer TC-031 logged in; balance 2,000,000 KZT; daily total 1,000,000 on 9 October (limit used up) |
| Reproducibility | 3 of 3 attempts |
| Severity | High (wrong limit for 5 hours every day) |
| Priority | Medium (proposed) |
| Traces to | REQ-3.2, checklist item 10 |
| Status | New, unassigned |

**Steps to reproduce**
1. Set the test env 2 clock to 10 October 2026, 00:10 Asia/Almaty.
2. Open Transfers → Between my accounts, select the deposit ending 7741, enter 100 and tap Continue.
3. Set the clock to 10 October 2026, 05:10 Asia/Almaty.
4. Repeat step 2.

**Expected result**
The daily limit resets at midnight Almaty time (REQ-3.2). At step 2 the transfer of 100 KZT executes.

**Actual result**
At step 2 the daily limit error is shown. At step 4 the same transfer executes. The reset happens at 05:00 Almaty, which is 00:00 UTC.

**Evidence needed:** screenshots of both attempts with the clock visible, request IDs, the time zone setting of the server.
