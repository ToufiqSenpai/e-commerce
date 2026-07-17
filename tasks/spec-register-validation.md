# Spec: Strapi Validation Error Handling on Register Page

## Objective

When the Strapi registration request returns a `400 ValidationError`, surface the
field-specific messages directly beneath the offending input instead of only
showing a generic top-level banner. This gives the user immediate, inline guidance
(e.g. "email must be a valid email", "username already taken").

## Tech Stack

- Nuxt 4 + Vue 3 (`<script setup lang="ts">`)
- `@nuxtjs/strapi` providing `Strapi5Error` type and `useStrapiAuth().register()`
- Tailwind utility classes already in use (e.g. `text-destructive`, `border-destructive/20`)

## Error Shape (source of truth)

```json
{
  "data": null,
  "error": {
    "status": 400,
    "name": "ValidationError",
    "message": "...",
    "details": {
      "errors": [{ "path": ["email"], "message": "email must be a valid email", "name": "ValidationError" }]
    }
  }
}
```

## Commands

- Dev: `npm run dev -w web`
- Build: `npm run build -w web`
- Lint: `npm run lint -w web`
- (No automated tests added unless requested)

## Project Structure

- `apps/web/app/pages/register.vue` — the only file changed.

## Code Style

- Keep existing `ref()` state pattern. Add a `fieldErrors` reactive map
  `Record<string, string>` (use `Record<string, unknown>` style per taste → `Record<string, string>` is fine since values are messages).
- Type the caught error as `Strapi5Error` instead of `any`.
- Inline helper styled consistently with the existing error banner:

```vue
<p v-if="fieldErrors.email" class="mt-1 text-sm text-destructive">
  {{ fieldErrors.email }}
</p>
```

## Testing Strategy

- Manual verification in browser: submit invalid email / short password and confirm
  the message appears under the right field. Non-field errors (network failure) still
  show the top-level banner.

## Boundaries

- Always: keep top-level `errorMessage` banner for non-field errors; reset `fieldErrors`
  on every new submit attempt.
- Ask first: not needed (single-file, no new deps).
- Never: commit secrets; alter backend.

## Success Criteria

- On a `ValidationError`, each errored field shows its message beneath the input.
- Valid submits and unknown errors continue to behave as before (banner + redirect).
- No `any` typing; uses `Strapi5Error`.

## Open Questions

- None. Proceeding with the assumptions above.
