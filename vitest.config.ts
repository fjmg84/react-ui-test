import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,  // ¡Provee describe, it, expect, vi automaticamente!
    include: ['tests/**/*.test.tsx'],
  }
})