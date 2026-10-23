import { Locator, Page } from '@playwright/test';

/** Things every screen has: the header and the page title. */
export class BasePage {
  readonly pageTitle: Locator;
  readonly cartQuantity: Locator;

  constructor(protected readonly page: Page) {
    this.pageTitle = page.getByTestId('page-title');
    this.cartQuantity = page.getByTestId('cart-quantity');
  }
}
