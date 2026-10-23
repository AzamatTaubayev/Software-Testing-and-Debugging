import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  readonly itemTitles: Locator;
  readonly itemQuantities: Locator;
  private readonly proceedButton: Locator;

  constructor(page: Page) {
    super(page);
    this.itemTitles = page.getByTestId('product-title');
    this.itemQuantities = page.getByTestId('product-quantity');
    this.proceedButton = page.getByTestId('proceed-1');
  }

  async open() {
    await this.page.getByTestId('nav-cart').click();
  }

  async proceedToCheckout() {
    await this.proceedButton.click();
  }
}
