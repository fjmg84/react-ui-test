// UI Testing Vitest Entry Point  
// Configures vitest globals for @fjmg84/uitest

import { describe, it, test, beforeEach, afterEach, expect, vi } from 'vitest'

// Re-export vitest globals for use in test files
export { describe, it, test, beforeEach, afterEach, expect, vi }

// Configure vitest globals when this file is imported
const g = globalThis as any
g.describe = describe
g.it = it
g.test = test
g.beforeEach = beforeEach
g.afterEach = afterEach
g.expect = expect
g.vi = vi
