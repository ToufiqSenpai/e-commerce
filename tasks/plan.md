# Implementation Plan: Account Dashboard

## Overview

We will build the `/account` dashboard page for authenticated users. This page will feature a tabbed interface (or side navigation) to switch between two main sections: **Account Settings** (displaying user profile details) and **Address** (managing shipping/billing addresses).

## Architecture Decisions

- **Layout Structure:** We'll use a responsive tabbed layout. On mobile, it might appear as a simple top tab bar or dropdown; on desktop, a sidebar or horizontal tabs.
- **Data Fetching (Address):** We will use the existing `Address` collection in Strapi. We will fetch addresses belonging to the current user using `useStrapi().find('addresses')` with the appropriate user filters.
- **State Management:** `useStrapiUser()` will provide the user context for the Account Settings tab.

## Task List

### Phase 1: Foundation

- [ ] Task 1: Add `Address` interface to `types/strapi.ts` based on the Strapi schema.

### Phase 2: Components

- [ ] Task 2: Create `AccountSettings.vue` component to display the logged-in user's profile information (Username, Email, etc.).
- [ ] Task 3: Create `AddressBook.vue` component to fetch and display the user's saved addresses from Strapi.
- [ ] Task 4: Create `AddressForm.vue` component to allow users to add new addresses (using Strapi `create` API).

### Phase 3: Page Integration

- [ ] Task 5: Create `pages/account.vue` combining the tab navigation and rendering either `AccountSettings` or `AddressBook` based on the active tab state.

### Checkpoint: Complete

- [ ] Users can navigate to `/account` and see their profile.
- [ ] Clicking the "Address" tab switches the view to the address list.
- [ ] Accessing `/account` without being logged in should redirect to `/login` (via Nuxt middleware).

## Risks and Mitigations

| Risk                   | Impact | Mitigation                                                                                                                                     |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Unauthenticated Access | High   | We must implement an inline route middleware in `account.vue` to ensure only logged-in users can access this page.                             |
| Address Relation       | Med    | We need to ensure the Strapi `Address` content type has a relation to the `User` content type, and the public/authenticated roles can read it. |

## Open Questions

- Do we need to build the "Create/Edit Address" form now, or just the list view? (Defaulting to just list view for this iteration).
