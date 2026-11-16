// Public type surface of the library.
//
// This must stay a real module (not a .d.ts): TypeScript does not emit output
// for .d.ts inputs, so a .d.ts here would leave `dist/core/expectations.d.ts`
// importing a file that does not exist in the published package.

/** Options shared by every assertion. */
export interface ExpectOptions {
  /** Max time to wait for the condition to hold, in ms. Default: 3000. */
  timeout?: number
}

/** Assertions bound to a single element, resolved by its accessible label. */
export interface ElementExpectAPI {
  toSee(text: string | RegExp, options?: ExpectOptions): Promise<void>
  toHaveValue(value: string, options?: ExpectOptions): Promise<void>
  toBeDisabled(options?: ExpectOptions): Promise<void>
  toBeEnabled(options?: ExpectOptions): Promise<void>
  toBeChecked(options?: ExpectOptions): Promise<void>
  toBeUnchecked(options?: ExpectOptions): Promise<void>
  toBeValid(options?: ExpectOptions): Promise<void>
  toBeInvalid(options?: ExpectOptions): Promise<void>
  toHaveAttribute(attr: string, value?: string, options?: ExpectOptions): Promise<void>
  toHaveClass(className: string, options?: ExpectOptions): Promise<void>
  toHaveText(text: string | RegExp, options?: ExpectOptions): Promise<void>
}

// Provider shapes used by the pending provider-inference work (CORRECTIONS.md §2).
// Not exported from the package entry point yet.

export interface ProviderConfig {
  import: string
  from: string
  props?: Record<string, unknown> | ((context: { component: string }) => Record<string, unknown>)
  /** If true, always wrap the component even when the hook is not detected. */
  alwaysWrap?: boolean
}

export interface ProviderMap {
  [hookName: string]: ProviderConfig
}

export interface ConfigureProvidersOptions {
  providers: ProviderMap
  /** Query client used for tests; typed as `unknown` until @tanstack/react-query is a real dependency. */
  queryClient?: unknown
  testRouter?: unknown
}
