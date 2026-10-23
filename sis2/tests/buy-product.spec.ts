import { test, expect } from '../fixtures/pages.fixture';
import { products } from '../data/user.factory';

test.describe('TC-03 Buy a product', () => {
  test('two Combination Pliers go through the cart and checkout', async ({
    productPage, cartPage, checkoutPage, registeredUser,
  }) => {
    const quantity = 2;

    await productPage.openByName(products.combinationPliers);
    await productPage.addToCart(quantity);
    await expect(productPage.cartQuantity).toHaveText(String(quantity));

    // Cart shows the right item and quantity
    await cartPage.open();
    await expect(cartPage.itemTitles).toHaveCount(1);
    await expect(cartPage.itemTitles).toHaveText(products.combinationPliers);
    await expect(cartPage.itemQuantities).toHaveValue(String(quantity));

    // Checkout completes
    await cartPage.proceedToCheckout();
    await checkoutPage.signIn(registeredUser);
    await checkoutPage.fillAddress(registeredUser.address);
    await checkoutPage.payCashOnDelivery();
    await expect(checkoutPage.paymentSuccess).toBeVisible();
    const invoice = await checkoutPage.confirmOrder();
    expect(invoice.status(), 'invoice was not created').toBe(201);
    await expect(checkoutPage.orderConfirmation).toBeVisible();
    await expect(checkoutPage.orderConfirmation).toContainText(/INV-\d+/);
  });
});
