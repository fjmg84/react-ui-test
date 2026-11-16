import type { ReactElement, ComponentType } from 'react'
import type { QueryClient } from '@tanstack/react-query'

export interface ProviderConfig {
  import: string
  from: string
  props?: Record<string, unknown> | ((context: { component: string }) => Record<string, unknown>)
  /** Si true, siempre se wrappea aunque no se detecte el hook */
  alwaysWrap?: boolean
}

export interface ProviderMap {
  [hookName: string]: ProviderConfig
}

export interface ConfigureProvidersOptions {
  providers: ProviderMap
  /** Configuración global de QueryClient para tests */
  queryClient?: QueryClient
  /** Router de prueba para react-router */
  testRouter?: unknown
}

export interface RenderOptions {
  /** Wrapper personalizado (override total) */
  wrapper?: ComponentType<{ children: React.ReactNode }>
  /** Providers adicionales solo para este render */
  providers?: ProviderConfig[]
  /** Deshabilita provider inference para este render */
  inferProviders?: boolean
}

export interface QueryOptions {
  /** Timeout en ms para findBy* */
  timeout?: number
  /** Selector exacto vs parcial */
  exact?: boolean
}

export interface ActionOptions {
  /** Timeout para esperar que el elemento esté listo */
  timeout?: number
  /** Delay entre keystrokes (para type) */
  delay?: number
}

export interface ExpectOptions {
  timeout?: number
}

export interface TestContext {
  /** Queries */
  getByText: (text: string | RegExp, options?: QueryOptions) => HTMLElement
  getByLabelText: (text: string | RegExp, options?: QueryOptions) => HTMLElement
  getByPlaceholder: (text: string | RegExp, options?: QueryOptions) => HTMLElement
  getByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => HTMLElement
  getByTestId: (id: string, options?: QueryOptions) => HTMLElement
  findByText: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
  findByLabelText: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
  findByPlaceholder: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
  findByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => Promise<HTMLElement>
  findByTestId: (id: string, options?: QueryOptions) => Promise<HTMLElement>
  queryByText: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
  queryByLabelText: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
  queryByPlaceholder: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
  queryByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => HTMLElement | null
  queryByTestId: (id: string, options?: QueryOptions) => HTMLElement | null
  getAllByText: (text: string | RegExp, options?: QueryOptions) => HTMLElement[]
  getAllByLabelText: (text: string | RegExp, options?: QueryOptions) => HTMLElement[]
  getAllByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => HTMLElement[]
  getAllByTestId: (id: string, options?: QueryOptions) => HTMLElement[]

  /** Actions */
  fill: (label: string, value: string, options?: ActionOptions) => Promise<void>
  click: (textOrRole: string, options?: ActionOptions) => Promise<void>
  doubleClick: (textOrRole: string, options?: ActionOptions) => Promise<void>
  rightClick: (textOrRole: string, options?: ActionOptions) => Promise<void>
  hover: (textOrRole: string, options?: ActionOptions) => Promise<void>
  unhover: (textOrRole: string, options?: ActionOptions) => Promise<void>
  select: (label: string, value: string, options?: ActionOptions) => Promise<void>
  selectOptions: (label: string, values: string[], options?: ActionOptions) => Promise<void>
  check: (label: string, options?: ActionOptions) => Promise<void>
  uncheck: (label: string, options?: ActionOptions) => Promise<void>
  press: (key: string, options?: ActionOptions) => Promise<void>
  type: (label: string, text: string, options?: ActionOptions) => Promise<void>
  clear: (label: string, options?: ActionOptions) => Promise<void>
  upload: (label: string, files: File[], options?: ActionOptions) => Promise<void>

  /** Expectations */
  expect: ExpectAPI

  /** Screen directo de Testing Library */
  screen: {
    getByText: (text: string | RegExp, options?: QueryOptions) => HTMLElement
    getByLabelText: (text: string | RegExp, options?: QueryOptions) => HTMLElement
    getByPlaceholder: (text: string | RegExp, options?: QueryOptions) => HTMLElement
    getByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => HTMLElement
    getByTestId: (id: string, options?: QueryOptions) => HTMLElement
    findByText: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
    findByLabelText: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
    findByPlaceholder: (text: string | RegExp, options?: QueryOptions) => Promise<HTMLElement>
    findByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => Promise<HTMLElement>
    findByTestId: (id: string, options?: QueryOptions) => Promise<HTMLElement>
    queryByText: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
    queryByLabelText: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
    queryByPlaceholder: (text: string | RegExp, options?: QueryOptions) => HTMLElement | null
    queryByRole: (role: string, options?: { name?: string | RegExp } & QueryOptions) => HTMLElement | null
    queryByTestId: (id: string, options?: QueryOptions) => HTMLElement | null
  }
}

export interface ExpectAPI {
  toSee: (text: string | RegExp, options?: ExpectOptions) => Promise<void>
  notToSee: (text: string | RegExp, options?: ExpectOptions) => Promise<void>
  toHaveValue: (label: string, value: string, options?: ExpectOptions) => Promise<void>
  toBeDisabled: (label: string, options?: ExpectOptions) => Promise<void>
  toBeEnabled: (label: string, options?: ExpectOptions) => Promise<void>
  toBeChecked: (label: string, options?: ExpectOptions) => Promise<void>
  toBeUnchecked: (label: string, options?: ExpectOptions) => Promise<void>
  toBeValid: (label: string, options?: ExpectOptions) => Promise<void>
  toBeInvalid: (label: string, options?: ExpectOptions) => Promise<void>
  toHaveAttribute: (label: string, attr: string, value?: string, options?: ExpectOptions) => Promise<void>
  toHaveClass: (label: string, className: string, options?: ExpectOptions) => Promise<void>
  urlToBe: (url: string, options?: ExpectOptions) => Promise<void>
  urlToContain: (substring: string, options?: ExpectOptions) => Promise<void>
  urlToMatch: (pattern: RegExp, options?: ExpectOptions) => Promise<void>
  element: (label: string) => ElementExpectAPI
}

export interface ElementExpectAPI {
  toSee: (text: string | RegExp, options?: ExpectOptions) => Promise<void>
  toHaveValue: (value: string, options?: ExpectOptions) => Promise<void>
  toBeDisabled: (options?: ExpectOptions) => Promise<void>
  toBeEnabled: (options?: ExpectOptions) => Promise<void>
  toBeChecked: (options?: ExpectOptions) => Promise<void>
  toBeUnchecked: (options?: ExpectOptions) => Promise<void>
  toBeValid: (options?: ExpectOptions) => Promise<void>
  toBeInvalid: (options?: ExpectOptions) => Promise<void>
  toHaveAttribute: (attr: string, value?: string, options?: ExpectOptions) => Promise<void>
  toHaveClass: (className: string, options?: ExpectOptions) => Promise<void>
  toHaveText: (text: string | RegExp, options?: ExpectOptions) => Promise<void>
}

export interface DescribeFunction {
  (component: ComponentType<any> | string, tests: (context: TestContext) => void): void
  (name: string, tests: (context: TestContext) => void): void
}

export interface ItFunction {
  (name: string, testFn: (context: TestContext) => Promise<void> | void): void
}

// Global types for vitest integration
declare global {
  namespace Vi {
    interface Jest {
      fn: <T extends (...args: any[]) => any>(implementation?: T) => Mock<T>
    }
  }

  var describe: DescribeFunction
  var it: ItFunction
  var test: ItFunction
  var expect: ExpectAPI
  var beforeEach: (fn: () => void) => void
  var afterEach: (fn: () => void) => void
  var vi: Vi.Jest
}

export {}