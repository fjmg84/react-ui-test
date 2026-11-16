// Vitest Integration for react-ui-test  
// Provides describe/it/expect globals

import { describe as vitestDescribe, it as vitestIt, beforeEach as vitestBeforeEach, afterEach as vitestAfterEach, expect as vitestExpect, vi, test as vitestTest } from 'vitest'

export const describe = vitestDescribe
export const it = vitestIt
export const beforeEach = vitestBeforeEach
export const afterEach = vitestAfterEach
export const expect = vitestExpect
export const test = vitestTest
export { vi }