// UI Testing Vitest Entry Point  
// Configures vitest globals for react-ui-test

// Re-export vitest globals for use in test files
export { describe, it, test, beforeEach, afterEach, expect, vi } from 'vitest'

// Configure vitest globals when this file is imported
globalThis.describe = describe
globalThis.it = it
globalThis.test = test
globalThis.beforeEach = beforeEach
globalThis.afterEach = afterEach
globalThis.expect = expect
globalThis.vi = vi