import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { RegisterPage } from '../pages/register.page';
import { ForgotPasswordPage } from '../pages/forgot-password.page';
import { ProductPage } from '../pages/product.page';
import { CartPage } from '../pages/cart.page';
import { CheckoutPage } from '../pages/checkout.page';
import { newCustomer, User } from '../data/user.factory';

const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

type Fixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  forgotPasswordPage: ForgotPasswordPage;
  productPage: ProductPage;
  cartPage: CartPage;
  checkoutPage: CheckoutPage;
  /** A fresh, not yet registered customer whose address matches the server's postcode lookup. */
  newUser: User;
  /** A fresh customer created through the API before the test starts. */
  registeredUser: User;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => { await use(new LoginPage(page)); },
  registerPage: async ({ page }, use) => { await use(new RegisterPage(page)); },
  forgotPasswordPage: async ({ page }, use) => { await use(new ForgotPasswordPage(page)); },
  productPage: async ({ page }, use) => { await use(new ProductPage(page)); },
  cartPage: async ({ page }, use) => { await use(new CartPage(page)); },
  checkoutPage: async ({ page }, use) => { await use(new CheckoutPage(page)); },

  // Every test that needs an existing account gets its own one.
  // We do not use the seeded customer@ accounts: the password-reset flow changes the
  // password of any account it is run on, and other students run it on the seeded ones.
  // The demo server fills addresses from a fake postcode lookup (Faker), and checkout rejects
  // an invoice (422) when city/state do not match that lookup. The page also patches the form
  // with the lookup result at an unpredictable moment. So we take street, city and state from
  // the same lookup: whatever the page patches, the values are the same.
  newUser: async ({ request }, use) => {
    const user = newCustomer();
    const lookup = await request.get(`${API_URL}/postcode-lookup`, {
      params: { country: user.address.country, postcode: user.address.postalCode, house_number: user.address.houseNumber },
    });
    expect(lookup.status(), `postcode lookup failed: ${await lookup.text()}`).toBe(200);
    const found = await lookup.json();
    user.address.street = found.street;
    user.address.city = found.city;
    user.address.state = found.state;
    await use(user);
  },

  registeredUser: async ({ request, newUser }, use) => {
    const user = newUser;
    const response = await request.post(`${API_URL}/users/register`, {
      data: {
        first_name: user.firstName,
        last_name: user.lastName,
        dob: user.dob,
        phone: user.phone,
        email: user.email,
        password: user.password,
        address: {
          street: user.address.street,
          house_number: user.address.houseNumber,
          city: user.address.city,
          state: user.address.state,
          country: user.address.country,
          postal_code: user.address.postalCode,
        },
      },
    });
    expect(response.status(), `register via API failed: ${await response.text()}`).toBe(201);
    await use(user);
  },
});

export { expect };
