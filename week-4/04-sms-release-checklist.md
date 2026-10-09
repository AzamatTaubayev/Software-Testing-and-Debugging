# 4. Release checklist: SMS code flow

Run on every release candidate, on iOS, Android and web. Test customer TC-014 (balance 1,000,000, daily total 0), amount 300,000 unless stated.

| # | Check | iOS | Android | Web | From week 3 |
|---|---|---|---|---|---|
| 1 | 100,000 transfers with no SMS code; 100,001 asks for a code | [ ] | [ ] | [ ] | BVA, SMS border |
| 2 | SMS code arrives within 30 seconds and has 6 digits | [ ] | [ ] | [ ] | REQ-3.3 |
| 3 | Correct code within 120 s executes the transfer once | [ ] | [ ] | [ ] | S1 → S4 |
| 4 | Code expires after 120 seconds and the transfer is cancelled | [ ] | [ ] | [ ] | S1 → S5 |
| 5 | Code entered after expiry is rejected, no debit | [ ] | [ ] | [ ] | Expired + correct code |
| 6 | Third wrong code cancels the transfer; a correct code after that is rejected | [ ] | [ ] | [ ] | S3 → S6, Blocked + correct code |
| 7 | Confirm tapped twice debits once | [ ] | [ ] | [ ] | Confirmed + correct code |
| 8 | A successful transfer is not cancelled when the 120 s timer ends afterwards | [ ] | [ ] | [ ] | Confirmed + 120 s |
| 9 | Balance and daily total update right after confirmation | [ ] | [ ] | [ ] | REQ-3.2 |
| 10 | Daily total resets at 00:00 Almaty time, not at 05:00 (UTC midnight) | [ ] | [ ] | [ ] | Time boundary |
| 11 | SMS text and code screen are correct in Kazakh, Russian and English | [ ] | [ ] | [ ] | Pairwise set |
| 12 | No SMS is sent when the transfer is rejected for the amount (500,001) or the daily limit | [ ] | [ ] | [ ] | Decision table |

Tester: __________ Build: __________ Date: __________
