import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export interface ProductInfo {
  name: string;
  price: number;
}

function exact(text: string): RegExp {
  return new RegExp(`^\\s*${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`);
}

/** Catalogue (home page search) + product detail page. */
export class ProductPage extends BasePage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  private readonly increase: Locator;
  private readonly addToCartButton: Locator;

  constructor(page: Page) {
    super(page);
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.increase = page.getByTestId('increase-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
  }

  /** Finds a product by its exact name through the search box and opens its detail page. */
  async openByName(productName: string) {
    await this.page.goto('/');
    await this.page.getByTestId('search-query').fill(productName);
    await this.page.getByTestId('search-submit').click();
    await this.page.getByTestId('product-name').filter({ hasText: exact(productName) }).first().click();
    await this.name.filter({ hasText: exact(productName) }).waitFor();
  }

  /** Reads name and price from the open detail page. */
  async capture(): Promise<ProductInfo> {
    const name = (await this.name.innerText()).trim();
    const price = Number((await this.unitPrice.innerText()).trim());
    return { name, price };
  }

  async addToCart(quantity = 1) {
    for (let i = 1; i < quantity; i++) {
      await this.increase.click();
    }
    await this.addToCartButton.click();
  }
}
