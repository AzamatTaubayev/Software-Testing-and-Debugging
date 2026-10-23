import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { User } from '../data/user.factory';

export class RegisterPage extends BasePage {
  readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.error = page.getByTestId('register-error');
  }

  async open() {
    await this.page.goto('/auth/register');
  }

  async register(user: User) {
    const f = (id: string) => this.page.getByTestId(id);
    await f('first-name').fill(user.firstName);
    await f('last-name').fill(user.lastName);
    await f('dob').fill(user.dob);
    // Country, postcode and house number first: they trigger the postcode lookup,
    // which may patch street/city/state. Filling those last keeps our values.
    await f('country').selectOption(user.address.country);
    await f('postal_code').fill(user.address.postalCode);
    await f('house_number').fill(user.address.houseNumber);
    await f('street').fill(user.address.street);
    await f('city').fill(user.address.city);
    await f('state').fill(user.address.state);
    await f('phone').fill(user.phone);
    await f('email').fill(user.email);
    await f('password').fill(user.password);
    await f('register-submit').click();
  }
}
