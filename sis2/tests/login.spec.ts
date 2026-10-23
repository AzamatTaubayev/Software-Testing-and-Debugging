import { test, expect } from '../fixtures/pages.fixture';

test.describe('TC-02 Log in', () => {
  test('valid credentials open the account page', async ({ loginPage, registeredUser, page }) => {
    await loginPage.open();
    await loginPage.signIn(registeredUser);

    await expect(page).toHaveURL(/\/account/);
    await expect(loginPage.pageTitle).toHaveText(/My account/);
  });

  test('a wrong password shows an error and stays on the login page', async ({ loginPage, registeredUser, page }) => {
    await loginPage.open();
    await loginPage.signIn({ email: registeredUser.email, password: 'Wrong!Password1' });

    await expect(loginPage.error).toHaveText(/Invalid email or password/);
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page).not.toHaveURL(/\/account/);
  });
});
