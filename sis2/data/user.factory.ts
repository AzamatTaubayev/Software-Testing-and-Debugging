import { randomUUID } from 'crypto';

export interface Address {
  street: string;
  houseNumber: string;
  city: string;
  state: string;
  country: string;      // ISO code used by the country <select>
  postalCode: string;
}

export interface User {
  firstName: string;
  lastName: string;
  dob: string;          // YYYY-MM-DD, the format the form expects
  phone: string;
  email: string;
  password: string;
  address: Address;
}

/**
 * A brand-new customer for every call. The email must be unique on every run,
 * otherwise the second run fails with "A customer with this email address already exists".
 * The password satisfies the API rules: min 8, mixed case, number, symbol, not in a breach list.
 */
export function newCustomer(): User {
  const id = randomUUID().replace(/-/g, '').slice(0, 12);
  return {
    firstName: 'Azamat',
    lastName: 'Tester',
    dob: '1995-05-15',
    phone: '77011234567',
    email: `sis2.${id}@example.com`,
    password: `Tsh!${id}Qz9`,
    address: {
      street: 'Abay Avenue',
      houseNumber: '13',
      city: 'Almaty',
      state: 'Almaty',
      country: 'KZ',      // street, city and state are replaced by the postcode lookup in the fixture
      postalCode: '050010',
    },
  };
}

/** An address that was never registered: used for the negative password-reset case. */
export function unknownEmail(): string {
  return `nobody.${randomUUID().slice(0, 8)}@example.com`;
}

/** Products used by the specs. Names are stable in the seed data; ids are not, so we never use ids. */
export const products = {
  combinationPliers: 'Combination Pliers',
  boltCutters: 'Bolt Cutters',
};

/** The demo API sets this fixed password when a reset is requested (UserService::resetPassword). */
export const RESET_PASSWORD = 'welcome02';
