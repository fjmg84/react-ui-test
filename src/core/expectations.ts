import { waitFor, within } from '@testing-library/react'
import { screen } from './render'
import type { ExpectOptions, ElementExpectAPI } from '../types/testing'

// Must stay below vitest's default testTimeout (5000ms), otherwise the runner
// timeout kills the test before the real assertion error is reported.
const DEFAULT_TIMEOUT = 3000

// Assertions in flight. An assertion that is never awaited must not pass the
// test silently, so every async assertion is tracked here and reported by
// flushPendingAssertions() (wired to an afterEach hook in src/index.ts).
const pending = new Set<Promise<unknown>>()

function track<T>(p: Promise<T>): Promise<T> {
  pending.add(p)
  // Keeps the rejection handled so an un-awaited assertion never surfaces as an
  // unhandled rejection; the failure is reported by flushPendingAssertions().
  p.then(
    () => { pending.delete(p) },
    () => { pending.delete(p) }
  )
  return p
}

function trackApi<T extends Record<string, any>>(api: T): T {
  const wrapped: Record<string, any> = {}
  for (const [key, value] of Object.entries(api)) {
    wrapped[key] =
      typeof value === 'function'
        ? (...args: any[]) => {
            const result = value(...args)
            return result && typeof result.then === 'function' ? track(result) : result
          }
        : value
  }
  return wrapped as T
}

/** Waits for assertions that were started but never awaited and fails on the first one that did not hold. */
export async function flushPendingAssertions(): Promise<void> {
  if (pending.size === 0) return
  const results = await Promise.allSettled([...pending])
  const failed = results.find((r) => r.status === 'rejected')
  if (failed) throw (failed as PromiseRejectedResult).reason
}

/** Resolves an element the way a user finds it: label, placeholder, role name, then test id. */
export function getElementByLabel(label: string): HTMLElement {
  const strategies = [
    () => screen.getByLabelText(label),
    () => screen.getByPlaceholderText(label),
    () => screen.getByRole('textbox', { name: label }),
    () => screen.getByRole('combobox', { name: label }),
    () => screen.getByRole('spinbutton', { name: label }),
    () => screen.getByTestId(label),
  ]

  for (const strategy of strategies) {
    try {
      return strategy()
    } catch {
      continue
    }
  }
  throw new Error(`No element found for label: "${label}"`)
}

async function waitForCondition(
  condition: () => void | Promise<void>,
  timeout: number = DEFAULT_TIMEOUT
): Promise<void> {
  await waitFor(condition, { timeout })
}

function createElementAPI(label: string): ElementExpectAPI {
  return trackApi({
    async toSee(text: string | RegExp, options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        if (!element.textContent?.match(text)) {
          throw new Error(`Expected element "${label}" to contain "${text}"`)
        }
      }, options.timeout)
    },

    async toHaveValue(value: string, options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const el = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        if (el.value !== value) {
          throw new Error(`Expected element "${label}" to have value "${value}", got "${el.value}"`)
        }
      }, options.timeout)
    },

    async toBeDisabled(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        if (!element.hasAttribute('disabled') && !(element as HTMLInputElement).disabled) {
          throw new Error(`Expected element "${label}" to be disabled`)
        }
      }, options.timeout)
    },

    async toBeEnabled(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        if (element.hasAttribute('disabled') || (element as HTMLInputElement).disabled) {
          throw new Error(`Expected element "${label}" to be enabled`)
        }
      }, options.timeout)
    },

    async toBeChecked(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const el = element as HTMLInputElement
        if (!el.checked) {
          throw new Error(`Expected element "${label}" to be checked`)
        }
      }, options.timeout)
    },

    async toBeUnchecked(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const el = element as HTMLInputElement
        if (el.checked) {
          throw new Error(`Expected element "${label}" to be unchecked`)
        }
      }, options.timeout)
    },

    async toBeValid(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const el = element as HTMLInputElement
        if (!el.checkValidity()) {
          throw new Error(`Expected element "${label}" to be valid`)
        }
      }, options.timeout)
    },

    async toBeInvalid(options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const el = element as HTMLInputElement
        if (el.checkValidity()) {
          throw new Error(`Expected element "${label}" to be invalid`)
        }
      }, options.timeout)
    },

    async toHaveAttribute(attr: string, value?: string, options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        const hasAttr = element.hasAttribute(attr)
        if (!hasAttr) {
          throw new Error(`Expected element "${label}" to have attribute "${attr}"`)
        }
        if (value !== undefined && element.getAttribute(attr) !== value) {
          throw new Error(`Expected element "${label}" attribute "${attr}" to be "${value}", got "${element.getAttribute(attr)}"`)
        }
      }, options.timeout)
    },

    async toHaveClass(className: string, options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        if (!element.classList.contains(className)) {
          throw new Error(`Expected element "${label}" to have class "${className}"`)
        }
      }, options.timeout)
    },

    async toHaveText(text: string | RegExp, options: ExpectOptions = {}) {
      const element = await waitForElement(label, options.timeout)
      await waitForCondition(() => {
        if (!element.textContent?.match(text)) {
          throw new Error(`Expected element "${label}" to have text "${text}"`)
        }
      }, options.timeout)
    },
  })
}

async function waitForElement(label: string, timeout: number = DEFAULT_TIMEOUT): Promise<HTMLElement> {
  return waitFor(() => getElementByLabel(label), { timeout })
}

const rawExpect = {
  async toSee(text: string | RegExp, options: ExpectOptions = {}) {
    await waitForCondition(() => {
      const element = screen.queryByText(text)
      if (!element) {
        throw new Error(`Expected to see "${text}"`)
      }
    }, options.timeout)
  },

  async notToSee(text: string | RegExp, options: ExpectOptions = {}) {
    await waitForCondition(() => {
      const element = screen.queryByText(text)
      if (element) {
        throw new Error(`Expected not to see "${text}"`)
      }
    }, options.timeout)
  },

  async toHaveValue(label: string, value: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const el = element as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      if (el.value !== value) {
        throw new Error(`Expected element "${label}" to have value "${value}", got "${el.value}"`)
      }
    }, options.timeout)
  },

  async toBeDisabled(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      if (!element.hasAttribute('disabled') && !(element as HTMLInputElement).disabled) {
        throw new Error(`Expected element "${label}" to be disabled`)
      }
    }, options.timeout)
  },

  async toBeEnabled(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      if (element.hasAttribute('disabled') || (element as HTMLInputElement).disabled) {
        throw new Error(`Expected element "${label}" to be enabled`)
      }
    }, options.timeout)
  },

  async toBeChecked(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const el = element as HTMLInputElement
      if (!el.checked) {
        throw new Error(`Expected element "${label}" to be checked`)
      }
    }, options.timeout)
  },

  async toBeUnchecked(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const el = element as HTMLInputElement
      if (el.checked) {
        throw new Error(`Expected element "${label}" to be unchecked`)
      }
    }, options.timeout)
  },

  async toBeValid(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const el = element as HTMLInputElement
      if (!el.checkValidity()) {
        throw new Error(`Expected element "${label}" to be valid`)
      }
    }, options.timeout)
  },

  async toBeInvalid(label: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const el = element as HTMLInputElement
      if (el.checkValidity()) {
        throw new Error(`Expected element "${label}" to be invalid`)
      }
    }, options.timeout)
  },

  async toHaveAttribute(label: string, attr: string, value?: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      const hasAttr = element.hasAttribute(attr)
      if (!hasAttr) {
        throw new Error(`Expected element "${label}" to have attribute "${attr}"`)
      }
      if (value !== undefined && element.getAttribute(attr) !== value) {
        throw new Error(`Expected element "${label}" attribute "${attr}" to be "${value}", got "${element.getAttribute(attr)}"`)
      }
    }, options.timeout)
  },

  async toHaveClass(label: string, className: string, options: ExpectOptions = {}) {
    const element = await waitForElement(label, options.timeout)
    await waitForCondition(() => {
      if (!element.classList.contains(className)) {
        throw new Error(`Expected element "${label}" to have class "${className}"`)
      }
    }, options.timeout)
  },

  async urlToBe(url: string, options: ExpectOptions = {}) {
    await waitForCondition(() => {
      if (window.location.pathname !== url && window.location.href !== url) {
        throw new Error(`Expected URL to be "${url}", got "${window.location.href}"`)
      }
    }, options.timeout)
  },

  async urlToContain(substring: string, options: ExpectOptions = {}) {
    await waitForCondition(() => {
      if (!window.location.href.includes(substring)) {
        throw new Error(`Expected URL to contain "${substring}", got "${window.location.href}"`)
      }
    }, options.timeout)
  },

  async urlToMatch(pattern: RegExp, options: ExpectOptions = {}) {
    await waitForCondition(() => {
      if (!pattern.test(window.location.href)) {
        throw new Error(`Expected URL to match "${pattern}", got "${window.location.href}"`)
      }
    }, options.timeout)
  },

  element: createElementAPI,
}

export const expect = trackApi(rawExpect)

export type { ElementExpectAPI }