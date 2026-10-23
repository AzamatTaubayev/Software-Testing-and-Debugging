import { test, expect } from '../fixtures/pages.fixture';
import { products } from '../data/user.factory';

test.describe('TC-04 Compare two products', () => {
  // Stated comparison: Bolt Cutters are more expensive than Combination Pliers.
  test('Bolt Cutters cost more than Combination Pliers', async ({ productPage }) => {
    await productPage.openByName(products.combinationPliers);
    const pliers = await productPage.capture();

    await productPage.openByName(products.boltCutters);
    const cutters = await productPage.capture();

    // We captured the products we asked for, with real prices
    expect(pliers.name).toBe(products.combinationPliers);
    expect(cutters.name).toBe(products.boltCutters);
    expect(pliers.price).toBeGreaterThan(0);
    expect(cutters.price).toBeGreaterThan(0);

    // The comparison itself
    expect(cutters.price).toBeGreaterThan(pliers.price);
  });
});
