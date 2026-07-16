# Taste (Continuously Learned by [CommandCode][cmd])

[cmd]: https://commandcode.ai/

# architecture

- Place external API calls in services, not controllers, for separation of concerns. Confidence: 0.65
- Consolidate related route definitions into a single route file (e.g., routes/address.ts) instead of creating separate route files per endpoint. Confidence: 0.90

# npm

- In npm workspaces, install workspace-specific devDependencies in the workspace's own package.json (e.g., apps/backend/package.json), not in the root workspace package.json. Confidence: 0.70

# git

- Use gh CLI to access the repository. Confidence: 0.65

# eslint

- Use ESLint's built-in stylistic preset from @eslint/js instead of @stylistic/eslint-plugin for style rules. Confidence: 0.65

# workflow

- When integrating with an external API, fetch and verify the actual response shape before coding against it instead of assuming the format. Confidence: 0.65
- Prefer using read_file over shell commands with Python for reading/parsing downloaded file contents. Confidence: 0.65
- Do not build, lint, test, or format the project without explicit user permission. Confidence: 0.75
- Use English for project documentation and content. Confidence: 0.65
