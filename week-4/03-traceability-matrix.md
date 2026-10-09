# 3. Traceability matrix

Status is "Not run" because there is no build of this feature to run the tests on. It shows what the matrix looks like before execution.

| Requirement | Test cases (full format in 02) | Other designed tests (week 3) | Technique | Status |
|---|---|---|---|---|
| REQ-3.1 Amount 100 – 500,000, whole tenge | TR-AMT-001, 002, 005, 006 | TR-AMT-007…017 (other boundaries, text, empty, too long) | Partitions + 3-value BVA | Not run |
| REQ-3.2 Daily limit 1,000,000, reset at midnight Almaty | TR-DAY-001, TR-DAY-002 | Midnight reset: checklist item 10, DEF-003 | BVA, decision table | Not run. TR-DAY-001 blocked until Q5 is answered |
| REQ-3.3 SMS code above 100,000; 120 s; 3 attempts | TR-AMT-002, 003, 004, TR-OTP-001, 007, 008 | TR-OTP-002…006, 009, 010 | BVA, state transition | Not run |
| REQ-3.5 Amount error shown when both rules are broken | TR-DAY-003 | — | Decision table R7 | Not run |
| **REQ-3.4 Insufficient balance** | **—** | **—** | **—** | **NOT COVERED** |

## Requirements I cannot cover, and why

**REQ-3.4 Insufficient balance.** The brief does not say what happens when the amount and the daily limit are fine but the balance is too low. I cannot write an expected result for behaviour nobody has defined, so there is no test. It is sent to the analyst as week 3 question Q1, and DEF-001 describes the risk. Until it is answered, it is residual risk in the test plan.

**Parts of REQ-3.2 and REQ-3.3 that are only partly covered:**
- Does a cancelled or expired transfer count toward the daily limit? Not defined (week 3 Q2).
- Can the customer request a new code, and does that reset the attempts? Not defined (Q3).
- A transfer confirmed after midnight: which day does it count for? Not defined (Q4).
- What happens at exactly 120 s: is the code still valid? Not defined.

These have no test case yet. Each will get one when the analyst answers.

## Coverage summary

- Requirements with at least one test case: 4 of 5 (REQ-3.4 has none).
- The 12 full test cases cover all four covered requirements.
