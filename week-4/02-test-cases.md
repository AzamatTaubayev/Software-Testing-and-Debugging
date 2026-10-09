# 2. Test cases

Twelve test cases from my week 3 design (partitions and boundaries, decision table, state transition).

**Common rules for every test case**
- Environment: test env 2, build number written in the run log.
- Before each test, reset the test customer with the data script, so the balance and daily total are exactly as in the preconditions. Tests do not depend on each other and can run in any order.
- "Source account" is always the customer's current account. "Recipient" is always the customer's own deposit.
- "Balance" means the balance of the source account shown on the Accounts screen.
- The test phone for the customer must be on hand to receive SMS codes.

| ID | Title | Traces to | Technique |
|---|---|---|---|
| TR-AMT-001 | Amount 99 is rejected | REQ-3.1 | 3-value BVA, lower border |
| TR-AMT-002 | Amount 100 executes without a code | REQ-3.1, REQ-3.3 | BVA, lower border |
| TR-AMT-003 | Amount 100,000 executes without a code | REQ-3.3 | BVA, SMS border |
| TR-AMT-004 | Amount 100,001 asks for an SMS code | REQ-3.3 | BVA, SMS border |
| TR-AMT-005 | Amount 500,001 is rejected | REQ-3.1 | BVA, upper border |
| TR-AMT-006 | Amount with tiyn is rejected | REQ-3.1 | Equivalence partition (not whole) |
| TR-DAY-001 | Daily total reaches exactly 1,000,000 | REQ-3.2 | BVA on daily limit |
| TR-DAY-002 | Daily total goes over 1,000,000 | REQ-3.2 | Decision table R3 |
| TR-DAY-003 | Amount error wins over daily limit error | REQ-3.5 | Decision table R7 |
| TR-OTP-001 | Correct code on the first attempt | REQ-3.3 | State transition S1 → S4 |
| TR-OTP-007 | Three wrong codes cancel the transfer | REQ-3.3 | State transition S1 → S2 → S3 → S6 |
| TR-OTP-008 | Confirm tapped twice debits once | REQ-3.3 | Invalid transition S4 + correct code |

---

### TR-AMT-001 · Amount 99 is rejected
**Traces to:** REQ-3.1 · **Technique:** 3-value BVA (border 99 | 100)

**Preconditions:** test customer TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417 as recipient.
3. Enter 99 in the amount field.
4. Tap Continue.

**Expected result**
- An error about the allowed amount (100 – 500,000 KZT) is shown, and the app stays on the transfer screen.
- No SMS arrives on the test phone within 60 s.
- Balance is still 1,000,000. No new entry in the statement.

**Postconditions:** no transfer created; daily total 0.

---

### TR-AMT-002 · Amount 100 executes without a code
**Traces to:** REQ-3.1, REQ-3.3 · **Technique:** BVA (border 99 | 100)

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 100.
4. Tap Continue.

**Expected result**
- The success screen is shown within 3 s. No SMS code screen appears.
- Balance shows 999,900. Deposit 4417 shows +100. One new statement entry of 100 KZT.

**Postconditions:** transfer status "Completed"; daily total 100.

---

### TR-AMT-003 · Amount 100,000 executes without a code
**Traces to:** REQ-3.3 · **Technique:** BVA (border 100,000 | 100,001). "Above 100,000" means 100,000 itself needs no code.

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 100000.
4. Tap Continue.

**Expected result**
- The success screen is shown. No SMS code screen; no SMS arrives on the test phone.
- Balance shows 900,000. One new statement entry of 100,000 KZT.

**Postconditions:** transfer "Completed"; daily total 100,000.

---

### TR-AMT-004 · Amount 100,001 asks for an SMS code
**Traces to:** REQ-3.3 · **Technique:** BVA (border 100,000 | 100,001)

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 100001.
4. Tap Continue.

**Expected result**
- The SMS code screen appears within 3 s, with a field for 6 digits.
- An SMS with a 6-digit code arrives on the test phone within 30 s.
- Balance is still 1,000,000. No new statement entry.

**Postconditions:** transfer "Pending confirmation". Leave the screen without entering the code; the transfer expires after 120 s.

---

### TR-AMT-005 · Amount 500,001 is rejected
**Traces to:** REQ-3.1 · **Technique:** 3-value BVA (border 500,000 | 500,001)

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 500001.
4. Tap Continue.

**Expected result**
- An error about the allowed amount (100 – 500,000 KZT) is shown. No SMS code screen.
- No SMS arrives within 60 s. Balance is still 1,000,000.

**Postconditions:** no transfer created; daily total 0.

---

### TR-AMT-006 · Amount with tiyn is rejected
**Traces to:** REQ-3.1 ("whole tenge only") · **Technique:** equivalence partition EP5 (not a whole number)

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Type 1500.50 in the amount field.
4. Tap Continue.

**Expected result**
- The amount 1,500.50 is not accepted. Either the field does not allow the decimal part to be typed (the field shows 1500), or an error about whole tenge is shown after Continue.
- If the field shows 1500 and the transfer goes through, it must be exactly 1,500 KZT, never 1,501.
- Balance is 1,000,000 (rejected) or 998,500 (field blocked decimals). Any other balance is a fail.

**Postconditions:** write down which of the two behaviours happened; it answers week 3 question Q8.

---

### TR-DAY-001 · Daily total reaches exactly 1,000,000
**Traces to:** REQ-3.2 · **Technique:** BVA on the daily limit (new total 1,000,000 | 1,000,001)

**Note:** assumes the limit is inclusive ("up to 1,000,000"). Blocked until the analyst confirms (week 3 Q5).

**Preconditions:** test customer TC-021 logged in; balance 1,000,000 KZT; daily total 900,000 (transfers already made today by the data script).

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 5520.
3. Enter 100000.
4. Tap Continue.

**Expected result**
- The success screen is shown, no SMS code (amount is not above 100,000).
- Balance shows 900,000. Deposit 5520 shows +100,000.

**Postconditions:** daily total exactly 1,000,000. Any further transfer today must be rejected.

---

### TR-DAY-002 · Daily total goes over 1,000,000
**Traces to:** REQ-3.2 · **Technique:** decision table, rule R3 (amount valid, limit exceeded, above 100,000)

**Preconditions:** test customer TC-022 logged in; balance 1,000,000 KZT; daily total 950,000.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 5521.
3. Enter 100001.
4. Tap Continue.

**Expected result**
- A daily limit error is shown (not the amount error).
- No SMS code screen and no SMS on the test phone within 60 s.
- Balance is still 1,000,000.

**Postconditions:** no transfer created; daily total still 950,000.

---

### TR-DAY-003 · Amount error wins over daily limit error
**Traces to:** REQ-3.5 · **Technique:** decision table, rule R7 (both rules broken)

**Preconditions:** test customer TC-023 logged in; balance 1,000,000 KZT; daily total 500,000.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 5522.
3. Enter 600000.
4. Tap Continue.

**Expected result**
- The amount error (100 – 500,000 KZT) is shown. The daily limit error is **not** shown.
- No SMS on the test phone. Balance is still 1,000,000.

**Postconditions:** no transfer created; daily total still 500,000.

---

### TR-OTP-001 · Correct code on the first attempt
**Traces to:** REQ-3.3 · **Technique:** state transition, Waiting·1 → Confirmed

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0; test phone on hand.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 300000 and tap Continue.
4. Read the 6-digit code from the SMS on the test phone.
5. Enter the code within 60 s and tap Confirm.

**Expected result**
- The success screen is shown.
- Balance shows 700,000. Deposit 4417 shows +300,000. Exactly one statement entry of 300,000.

**Postconditions:** transfer "Completed"; daily total 300,000.

---

### TR-OTP-007 · Three wrong codes cancel the transfer
**Traces to:** REQ-3.3 · **Technique:** state transition, Waiting·1 → Waiting·2 → Waiting·3 → Blocked

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0; test phone on hand.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 300000 and tap Continue.
4. Read the code from the SMS. Make a wrong code by changing its last digit (for example 482915 → 482916).
5. Enter the wrong code and tap Confirm.
6. Enter the same wrong code again and tap Confirm.
7. Enter the same wrong code a third time and tap Confirm.

**Expected result**
- After step 5: a "wrong code" message, the code screen stays open.
- After step 6: a "wrong code" message, the code screen stays open.
- After step 7: a message that the transfer is cancelled; the code screen closes.
- Balance is still 1,000,000. No statement entry.

**Postconditions:** transfer "Cancelled"; daily total 0.

---

### TR-OTP-008 · Confirm tapped twice debits once
**Traces to:** REQ-3.3 · **Technique:** invalid transition Confirmed + correct code (highest risk from week 3)

**Preconditions:** TC-014 logged in; balance 1,000,000 KZT; daily total 0; test phone on hand.

**Steps**
1. Open Transfers → Between my accounts.
2. Select the deposit ending 4417.
3. Enter 300000 and tap Continue.
4. Enter the correct code from the SMS.
5. Tap Confirm twice quickly (two taps within 1 second).

**Expected result**
- One success screen.
- Balance shows 700,000, not 400,000. Exactly one statement entry of 300,000.
- Deposit 4417 shows +300,000 once.

**Postconditions:** one transfer "Completed"; daily total 300,000.
