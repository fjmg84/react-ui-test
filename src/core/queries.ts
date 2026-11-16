// UI Testing Queries  
// Re-exports core testing-library APIs  
// For full type safety, import directly from @testing-library/react and @testing-library/dom

// Core: screen, render, cleanup from @testing-library/react
export { screen, render, cleanup } from '@testing-library/react'

// DOM queries from @testing-library/dom - all query methods  
export { 
  getByText, 
  getByLabelText, 
  getByPlaceholderText, 
  getByRole, 
  getByTestId,
  fireEvent,
  // Async queries
  findByText, 
  findByLabelText, 
  findByPlaceholderText, 
  findByRole, 
  findByTestId,
  // Null-aware queries
  queryByText, 
  queryByLabelText, 
  queryByPlaceholderText, 
  queryByRole, 
  queryByTestId,
  // Collection queries
  getAllByText, 
  getAllByLabelText, 
  getAllByRole, 
  getAllByTestId 
} from '@testing-library/dom'