import path from 'node:path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@fjmg84/uitest': path.resolve(__dirname, './src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
    globals: true,  // ¡Provee describe, it, expect, vi automaticamente!
    include: ['tests/**/*.test.tsx'],
  }
})