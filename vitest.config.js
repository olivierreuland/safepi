import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['safepi.js'],
      exclude: [
        'node_modules/',
        'test/',
        'coverage/',
        '*.config.js'
      ],
      // Enhanced coverage options in Vitest 3.x
      thresholds: {
        statements: 50,
        branches: 90,
        functions: 45,
        lines: 50
      }
    },
    // Improved performance settings
    pool: 'forks',
    // Better reporter for CI/CD
    reporter: ['verbose']
  }
})
