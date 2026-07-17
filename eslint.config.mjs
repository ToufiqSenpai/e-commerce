import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier'
import prettierConfig from 'eslint-config-prettier'

const prettierRuleConfig = {
  plugins: {
    prettier,
  },
  rules: {
    ...prettier.configs.recommended.rules,
  },
}

export default tseslint.config(
  {
    ignores: [
      'node_modules/',
      'build/',
      'dist/',
      '.cache/',
      '.tmp/',
      '.strapi/',
      '**/src/admin/',
      '**/types/generated/**',
    ],
  },
  eslint.configs.recommended,
  prettierConfig,

  // TypeScript-ESLint configs scoped to non-Vue files so they don't
  // override the vue-eslint-parser that eslint-plugin-vue requires.
  {
    files: ['**/*.ts', '**/*.js', '**/*.mjs'],
    extends: [...tseslint.configs.recommended, ...tseslint.configs.stylistic],
    ...prettierRuleConfig,
  },

  // Vue files: let eslint-plugin-vue / vue-eslint-parser handle parsing.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    ...prettierRuleConfig,
  },
)
