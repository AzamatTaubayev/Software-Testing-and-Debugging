import { test, expect } from '../fixtures/pages.fixture';
import { RESET_PASSWORD, unknownEmail } from '../data/user.factory';

test.describe('TC-05 Reset a password', () => {
  test('a known email gets the confirmation and the new password works', async ({
    forgotPasswordPage, loginPage, registeredUser, page,
  }) => {
    await forgotPasswordPage.open();
    const response = await forgotPasswordPage.requestReset(registeredUser.email);

    expect(response.status()).toBe(200);
    expect(await response.json()).toEqual({ success: true });
    await expect(forgotPasswordPage.confirmation).toBeVisible();
    await expect(forgotPasswordPage.serverError).toHaveCount(0);

    // The demo API sets a fixed new password; signing in with it proves the reset happened
    await loginPage.open();
    await loginPage.signIn({ email: registeredUser.email, password: RESET_PASSWORD });
    await expect(page).toHaveURL(/\/account/);
  });

  // Known defect DEF-SIS2-01: the success banner shows the raw translation key
  // "page.forgot-password.confirm" instead of "Your password is successfully updated!".
  // test.fail() keeps the suite green while the bug exists, and turns red when it is fixed.
  test('the confirmation shows a readable message', async ({ forgotPasswordPage, registeredUser }) => {
    test.fail(true, 'DEF-SIS2-01: confirmation banner shows the translation key, not the message');

    await forgotPasswordPage.open();
    await forgotPasswordPage.requestReset(registeredUser.email);

    await expect(forgotPasswordPage.confirmationText).toBeVisible({ timeout: 3_000 });
  });

  test('an email that is not registered gets an error', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    const response = await forgotPasswordPage.requestReset(unknownEmail());

    expect(response.status()).toBe(422);
    await expect(forgotPasswordPage.serverError).toBeVisible();
    await expect(forgotPasswordPage.serverError).toContainText('The selected email is invalid.');
  });

  test('a badly formatted email is rejected before it is sent', async ({ forgotPasswordPage }) => {
    await forgotPasswordPage.open();
    await forgotPasswordPage.submitMalformed('not-an-email');

    await expect(forgotPasswordPage.emailFormatError).toBeVisible();
    await expect(forgotPasswordPage.confirmation).toHaveCount(0);
  });
});
