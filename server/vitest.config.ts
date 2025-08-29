import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: './tests/setup.ts',
    include: ['**/*.test.ts'],
    alias: {
      '@shared': path.resolve(__dirname, '../shared'),
    },
  },
});
