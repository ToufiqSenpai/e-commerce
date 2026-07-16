/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  moduleDirectories: ['node_modules', '<rootDir>/../../node_modules'],
  transform: {
    '^.+\\.ts$': [
      '<rootDir>/../../node_modules/ts-jest',
      {
        tsconfig: {
          module: 'CommonJS',
          esModuleInterop: true,
          resolveJsonModule: true,
        },
      },
    ],
  },
}
