// Vitest globals configuration
/// <reference types="vitest" />

// Provee globals de test: describe, it, expect, beforeEach, afterEach, vi
import '@testing-library/jest-dom'

// Configurar vitest para proveer globals automaticos
const config: Partial<vitest.Config> = {
  test: {
    globals: true,  // Provee describe, it, expect, vi automaticamente
    environment: 'happy-dom',
  }
}

export default config