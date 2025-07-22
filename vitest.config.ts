import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // Use global APIs (describe, it, expect)
    environment: 'jsdom', // Default environment, can be overridden per package/file
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      reportsDirectory: './coverage',
      all: true, // Cover all files, not just tested ones
      include: ['sdks/typescript/*/src/**/*.{ts,tsx}'],
      exclude: [
        'sdks/typescript/*/src/index.{ts,tsx}',
        'sdks/typescript/*/**/*.d.ts',
        'sdks/typescript/*/**/__tests__/**',
        'sdks/typescript/*/**/dist/**',
        'docs/src/**',
      ],
    },
  },
});
