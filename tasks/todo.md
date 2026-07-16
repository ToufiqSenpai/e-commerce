## Task 1: Update Types

**Description:** Add the `Address` type to match the Strapi collection.
**Acceptance criteria:**

- [ ] `Address` interface is added to `types/strapi.ts`.
      **Dependencies:** None

## Task 2: Build Account Settings Component

**Description:** Create a component to show user details.
**Acceptance criteria:**

- [ ] Creates `components/account/AccountSettings.vue`.
- [ ] Displays Username and Email from `useStrapiUser()`.
      **Dependencies:** None

## Task 3: Build Address Book Component

**Description:** Create a component to list addresses.
**Acceptance criteria:**

- [ ] Creates `components/account/AddressBook.vue`.
- [ ] Fetches addresses from Strapi (`find('addresses')`).
- [ ] Displays empty state if no addresses exist.
      **Dependencies:** 1

## Task 4: Build Address Form Component

**Description:** Create a form to add a new address.
**Acceptance criteria:**

- [ ] Creates `components/account/AddressForm.vue`.
- [ ] Contains inputs for all required Address schema fields.
- [ ] Uses Strapi `create` to save the address and link to the user.
      **Dependencies:** 1

## Task 5: Create Account Page & Middleware

**Description:** Assemble the page with tabs and route protection.
**Acceptance criteria:**

- [ ] Creates `pages/account.vue`.
- [ ] Implements an inline Nuxt route middleware to redirect guests to `/login`.
- [ ] Adds tab UI to switch between `AccountSettings` and `AddressBook`/`AddressForm`.
      **Dependencies:** 2, 3, 4
