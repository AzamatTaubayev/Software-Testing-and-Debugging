# 6. AI appendix (Level 1)

**Tool:** Claude (Anthropic), in the Claude app.
**Used for:** this week 4 pack. Week 4 is Level 1: allowed, with disclosure.

## Prompts used

1. "Новая задача" ("New task"), with the Week 4 slides attached

This pack is built on my week 3 test design (test cases, decision table, state table, PICT output). That design was also made with Claude, with the professor's permission, and was submitted as the week 3 homework.

## Raw output

The files in this folder are the AI output as generated. The only part I wrote myself is the "What I checked myself" list below.

## Checks and corrections

Corrections the AI made when reviewing its own output:
- Week 4: a checklist item ("leaving the code screen does not reset the attempt counter") was removed because the brief does not define that behaviour. It was replaced with "no SMS is sent when the transfer is rejected", which comes from the decision table.
- Week 4: test customers TC-030 and TC-031 were added to the test plan, because the defect reports used them.

What I checked myself:
- **Test data consistency:** Verified that all test customer IDs (including TC-030 and TC-031), account balances, and transfer amounts are consistent across the test plan, checklist, decision table, and defect reports.
- **Decision table & boundary values:** Cross-checked the decision table rules against the course slides to ensure all combinations (amount validity, daily limit, SMS code threshold) and boundary values were correctly covered without contradictions. Insufficient funds is not in the decision table because the brief does not define it; it is listed as not covered in the traceability matrix.
- **Defect reports realism:** Reviewed the steps to reproduce, expected vs. actual outcomes, and proposed Severity/Priority ratings in `05-defect-reports.md` so they reflect realistic business impact and clear bug reporting standards.
- **Clarity and phrasing:** Checked the checklist and test case descriptions for concise QA terminology and ambiguous wording, ensuring each test step is unambiguous and verifiable.

## Limits I am aware of

- The defect reports are mock-ups designed from requirement gaps. Their environments, builds and observed results are examples, not real observations. This is stated at the top of `05-defect-reports.md`.
- The UI paths (Transfers → Between my accounts), test customers and account numbers come from the course slides or were made up for the test data. They are not from a real app.
- Severity and priority in the defect reports are proposals. The final values belong to the tester and the product owner.
