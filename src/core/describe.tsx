// UI Testing describe  
// describe(Component, (ctx) => ...)  → mounts the component before each test,
// passes a ctx with render + actions + screen + expect, and cleans up after.
// describe('string', fn)              → delegates to vitest (unchanged behavior).

import type { ComponentType } from 'react'
import { describe as vitestDescribe, beforeEach, afterEach } from 'vitest'
import { render as rtlRender, cleanup } from './render'
import { createContext, Ctx } from './context'

type TestsFn = (ctx: Ctx) => void

interface DescribeOptions {
  /** Props base para todos los tests del bloque */
  props?: Record<string, any>
  /** Título del suite (por defecto: Component.displayName || Component.name) */
  title?: string
}

function isComponent(value: any): value is ComponentType<any> {
  return typeof value === 'function' || (value && typeof value === 'object' && '$$typeof' in value)
}

function describeComponent(
  Component: ComponentType<any>,
  second: DescribeOptions | TestsFn,
  third?: TestsFn
): void {
  const options: DescribeOptions = typeof second === 'function' ? {} : second
  const fn: TestsFn = typeof second === 'function' ? second : third!
  const title = options.title || Component.displayName || Component.name || 'Component'

  let renderResult: ReturnType<typeof rtlRender> | null = null

  const baseProps = options.props ?? {}

  vitestDescribe(title, () => {
    beforeEach(() => {
      renderResult = rtlRender(<Component {...baseProps} />)
    })

    afterEach(() => {
      if (renderResult) {
        renderResult.unmount()
        renderResult = null
      }
      cleanup()
    })

    fn(
      createContext((props?: Record<string, any>) => {
        if (!renderResult) throw new Error('ctx.render called before the component was mounted')
        const merged = { ...baseProps, ...props }
        renderResult.rerender(<Component {...merged} />)
      })
    )
  })
}

export function describe(
  component: ComponentType<any>,
  tests: TestsFn
): void
export function describe(
  component: ComponentType<any>,
  options: DescribeOptions,
  tests: TestsFn
): void
export function describe(name: string, tests: TestsFn): void
export function describe(
  first: any,
  second: any,
  third?: any
): void {
  if (isComponent(first)) {
    describeComponent(first, second, third)
  } else {
    vitestDescribe(first, second)
  }
}
