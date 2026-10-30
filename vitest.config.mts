import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(import.meta.dirname, 'src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/app/api/dictionary/**'],
      exclude: ['src/lib/jlpt-data.ts', 'src/lib/__tests__/**'],
      reporter: ['text', 'html'],
    },
  },
});
