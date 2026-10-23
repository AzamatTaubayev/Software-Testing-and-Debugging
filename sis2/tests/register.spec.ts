import { test, expect } from '../fixtures/pages.fixture';

test.describe('TC-01 Register a new customer', () => {
  test('a unique new customer is created and can sign in', async ({ registerPage, loginPage, newUser, page }) => {
    const customer = newUser;

    await registerPage.open();
    await registerPage.register(customer);

    // After a successful registration the app sends the user to the login page
    await expect(page).toHaveURL(/\/auth\/login/);

    // Proof that the account really exists: the new credentials open the account page
    await loginPage.signIn(customer);
    await expect(page).toHaveURL(/\/account/);
    await expect(loginPage.pageTitle).toHaveText(/My account/);
  });

  test('an email that is already registered is rejected', async ({ registerPage, registeredUser, page }) => {
    const duplicate = { ...registeredUser };

    await registerPage.open();
    await registerPage.register(duplicate);

    await expect(registerPage.error).toContainText(/already exists/i);
    await expect(page).toHaveURL(/\/auth\/register/);
  });
});
