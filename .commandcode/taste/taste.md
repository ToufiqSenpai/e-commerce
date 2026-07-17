# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# nuxt

- Use Nuxt's auto-imports for Vue composition API utilities (ref, reactive, etc.) instead of importing them explicitly from 'vue'. Confidence: 0.70

# strapi

- Use Strapi's built-in logger instead of console.log. Confidence: 0.65

# architecture

- Place external API calls in services, not controllers, for separation of concerns. Confidence: 0.65
- Consolidate related route definitions into a single route file (e.g., routes/address.ts) instead of creating separate route files per endpoint. Confidence: 0.90

# npm

- In npm workspaces, install workspace-specific devDependencies in the workspace's own package.json (e.g., apps/backend/package.json), not in the root workspace package.json. Confidence: 0.70

# git

- Use gh CLI to access the repository. Confidence: 0.65

# typescript

- Use `unknown` instead of `any` for Record type values (`Record<string, unknown>`). Confidence: 0.75

# eslint

- Use ESLint's built-in stylistic preset from @eslint/js instead of @stylistic/eslint-plugin for style rules. Confidence: 0.65
- Place ESLint ignores in root config (eslint.config.mjs) rather than in workspace-specific configs in a monorepo. Confidence: 0.75

# testing

- For backend tests, make real external API calls instead of mocking them. Confidence: 0.80
- Use Testcontainers for ephemeral Postgres in e2e tests. Confidence: 0.50
- In e2e tests, set up and tear down the Strapi instance once at the root describe block level (file top-level), not per-endpoint describe block. Do not wrap endpoint describe blocks in a parent describe just to share setup/teardown. Confidence: 0.70

# workflow

- When integrating with an external API, fetch and verify the actual response shape before coding against it instead of assuming the format. Confidence: 0.65
- Prefer using read_file over shell commands with Python for reading/parsing downloaded file contents. Confidence: 0.65
- Do not build, lint, test, or format the project without explicit user permission. Confidence: 0.75
- Gunakan Bahasa Indonesia untuk komunikasi dan dokumentasi proyek. Confidence: 0.75
