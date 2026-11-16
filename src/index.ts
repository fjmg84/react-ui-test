// UI Testing Library re-exports  
// Provides convenient access to @testing-library APIs with additional globals

// Render and screen from @testing-library/react
export { render, screen, cleanup } from '@testing-library/react'

// Queries from @testing-library/dom
export { 
  getByText, 
  getByLabelText, 
  getByPlaceholderText, 
  getByRole, 
  getByTestId,
  fireEvent 
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

// Vitest globals (describe/it/test/hooks/vi). expect es el custom de la lib (label-based).
export { describe, it, test, beforeEach, afterEach, vi } from './vitest-integration'
export { expect } from './core/expectations'