import { waitFor, within } from '@testing-library/react'
import { screen } from './render'
import type { ExpectOptions, ElementExpectAPI } from '../types/testing'

const DEFAULT_TIMEOUT = 5000

function getElementByLabel(label: string): HTMLElement {
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
  return {
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
  }
}

async function waitForElement(label: string, timeout: number = DEFAULT_TIMEOUT): Promise<HTMLElement> {
  return waitFor(() => getElementByLabel(label), { timeout })
}

export const expect = {
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

export type { ElementExpectAPI }