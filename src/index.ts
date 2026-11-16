// UI Testing Library re-exports  
// Provides convenient access to @testing-library APIs with additional globals

// Render and screen from @testing-library/react (fireEvent here is act-wrapped)
export { render, screen, cleanup, fireEvent } from '@testing-library/react'

import { afterEach } from './vitest-integration'
import { flushPendingAssertions } from './core/expectations'

// Queries from @testing-library/dom
export { 
  getByText, 
  getByLabelText, 
  getByPlaceholderText, 
  getByRole, 
  getByTestId 
} from '@testing-library/dom'

// Async queries
export { 
  findByText, 
  findByLabelText, 
  findByPlaceholderText, 
  findByRole, 
  findByTestId,
  queryByText, 
  queryByLabelText, 
  queryByPlaceholderText, 
  queryByRole, 
  queryByTestId,
  getAllByText, 
  getAllByLabelText, 
  getAllByRole, 
  getAllByTestId 
} from '@testing-library/dom'

// Types
export type { RenderResult } from '@testing-library/react'

// describe(Component, (ctx) => ...) auto-renders; describe('string', fn) delegates to vitest
export { describe } from './core/describe'
export { it, test, beforeEach, afterEach, vi } from './vitest-integration'
// own label-based expect, with auto-retry
export { expect } from './core/expectations'
// Actions over screen + fireEvent (wrapped in act)
export {
  fill,
  click,
  type,
  clear,
  select,
  selectOptions,
  check,
  uncheck,
  press,
  hover,
  unhover,
  doubleClick,
  rightClick,
  upload,
} from './core/actions'

// An assertion that is started but never awaited must fail the test instead of
// passing silently. Registered at import time, like RTL's auto-cleanup.
try {
  afterEach(async () => {
    await flushPendingAssertions()
  })
} catch {
  // Library imported outside a test file: vitest refuses to register hooks.
}