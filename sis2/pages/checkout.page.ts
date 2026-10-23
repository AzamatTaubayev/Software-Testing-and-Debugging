import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './base.page';
import { Address, User } from '../data/user.factory';

/** Checkout steps 2–4: sign in, billing address, payment. Step 1 is the cart (CartPage). */
export class CheckoutPage extends BasePage {
  readonly paymentSuccess: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    super(page);
    this.paymentSuccess = page.getByTestId('payment-success-message');
    this.orderConfirmation = page.getByText(/Thanks for your order! Your invoice number is/);
  }

  private f(id: string) {
    return this.page.getByTestId(id);
  }

  /** Step 2: sign in inside the checkout, then continue. */
  async signIn(user: User) {
    await this.f('email').fill(user.email);
    await this.f('password').fill(user.password);
    await this.f('login-submit').click();
    await this.f('proceed-2').click();
  }

  /** Step 3: billing address. Same fill order as registration (lookup fields first). */
  async fillAddress(address: Address) {
    await this.f('country').selectOption(address.country);
    await this.f('postal_code').fill(address.postalCode);
    await this.f('house_number').fill(address.houseNumber);
    await this.f('street').fill(address.street);
    await this.f('city').fill(address.city);
    await this.f('state').fill(address.state);
    await this.f('proceed-3').click();
  }

  /** Step 4, first click: choose cash on delivery and check the payment. */
  async payCashOnDelivery() {
    await this.f('payment-method').selectOption('cash-on-delivery');
    await this.f('finish').click();
  }

  /**
   * Step 4, second click: confirm the order. The same button changes its label from
   * "Check payment" to "Confirm", so we click it only once it says "Confirm", and we wait
   * for the invoice request: on the shared demo server it can take several seconds.
   */
  async confirmOrder(): Promise<Response> {
    const [response] = await Promise.all([
      this.page.waitForResponse(
        r => r.url().includes('/invoices') && r.request().method() === 'POST',
        { timeout: 30_000 },
      ),
      this.f('finish').filter({ hasText: 'Confirm' }).click(),
    ]);
    return response;
  }
}
