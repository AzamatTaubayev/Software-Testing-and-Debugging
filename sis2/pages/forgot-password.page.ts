import { Locator, Page, Response } from '@playwright/test';
import { BasePage } from './base.page';

const errorText = /invalid|not found|does not exist/i;

export class ForgotPasswordPage extends BasePage {
  private readonly email: Locator;
  private readonly submit: Locator;
  /** Any result banner that is not an error. */
  readonly confirmation: Locator;
  /** The confirmation with the text the app is supposed to show (see the known defect in Review.md). */
  readonly confirmationText: Locator;
  readonly serverError: Locator;
  readonly emailFormatError: Locator;

  constructor(page: Page) {
    super(page);
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    // The two result banners have no data-test; they are role="alert", told apart by text.
    this.confirmation = page.getByRole('alert').filter({ hasNotText: errorText });
    this.confirmationText = page.getByRole('alert').filter({ hasText: /successfully updated/i });
    this.serverError = page.getByRole('alert').filter({ hasText: errorText });
    this.emailFormatError = page.getByTestId('email-error');
  }

  async open() {
    await this.page.goto('/auth/forgot-password');
  }

  /** Submits a well-formed email and returns the API response of the reset request. */
  async requestReset(email: string): Promise<Response> {
    await this.email.fill(email);
    const [response] = await Promise.all([
      this.page.waitForResponse(r => r.url().includes('/users/forgot-password') && r.request().method() === 'POST'),
      this.submit.click(),
    ]);
    return response;
  }

  /** Submits a malformed email: the form blocks it, so no request is sent. */
  async submitMalformed(email: string) {
    await this.email.fill(email);
    await this.submit.click();
  }
}
