# Corrections for f-react-ui-test

Current state: the library passes its own tests (4/4) but is not installable as a dependency by a consumer, and several of its public APIs are dead code or promise functions that do not exist.

The items are resolved in order. Each includes current state, problem, change, and expected result.

---

## 1. Packaging: RTL + vitest as peerDependencies

### Problem
`dependencies` only has `aria-query`. `@testing-library/react`, `@testing-library/dom` and `vitest` are in `devDependencies`, and `vitest` is not declared in `peerDependencies` even though `src/vitest-integration.ts` imports from `vitest`.

A consumer doing `import { render, expect } from 'f-react-ui-test'` gets:

```
Cannot find module '@testing-library/react' or its corresponding type declarations
```

### Change
Move to `peerDependencies`:

```json
"peerDependencies": {
  "react": ">=18",
  "react-dom": ">=18",
  "@testing-library/react": ">=16.0.0",
  "@testing-library/dom": ">=10.0.0",
  "vitest": ">=2.0.0"
}
```

Remove `@testing-library/react`, `@testing-library/dom` and `vitest` from `devDependencies` (keep them only if needed for internal development/testing).

### Expected result
`npm install f-react-ui-test` does not force RTL or vitest as regular dependencies; the consumer provides them.

---

## 2. Provider-inference: connect to render or delete

### Current state
`src/core/provider-inference.ts` exports `configureProviders`, `scanHooks` and `resolveProviders`, but **no file in `src/` imports it**. `render.tsx` is just:

```tsx
export * from '@testing-library/react'
```

So `render(<Component />)` never wraps anything. Also `scanHooks` uses `require('fs')` inside an ESM package (`"type": "module"`), which fails silently and always returns `[]`.

### Option A (recommended): connect to render for real

`render` receives `options?: RenderOptions` with `providers`, `inferProviders` and `wrapper`. Resolution happens at render time:

```tsx
// src/core/render.tsx
import { render as rtlRender, type RenderOptions as RTLRenderOptions } from '@testing-library/react'
import type { ReactElement } from 'react'
import { resolveProviders } from './provider-inference'

interface RenderOptions extends Omit<RTLRenderOptions, 'wrapper'> {
  providers?: ProviderConfig[]
  inferProviders?: boolean
}

export function render(
  ui: ReactElement,
  options?: RenderOptions
) {
  const providers = options?.providers ?? []
  const wrapper = options?.wrapper

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    let el = <>{children}</>
    // Apply providers in reverse order so they nest correctly
    for (const p of providers.reverse()) {
      const Provider = dynamicImportProvider(p.import, p.from)
      const props = typeof p.props === 'function'
        ? p.props({ component: ui.type.name })
        : p.props ?? {}
      el = <Provider {...props}>{el}</Provider>
    }
    if (wrapper) el = <wrapper>{el}</wrapper>
    return el
  }

  return rtlRender(<Wrapper>{ui}</Wrapper>, options)
}
```

**Important:** inferring providers by reading the component source file from the test (`scanHooks(componentFile)`) is fragile and does not work in bundled environments (Vite, bundlers, no `fs`). For the MVP it is recommended that the consumer configure `configureProviders` globally or pass `providers` per render, and **remove `scanHooks` / file reading**. `resolveProviders` should operate on a configured map, not on disk reading.

### Option B: delete it

If it will not be connected, delete `src/core/provider-inference.ts`, `configureProviders`, `ProviderConfig`, `ProviderMap` and `ConfigureProvidersOptions` from types, and remove `configureProviders` from `index.ts` exports.

### Expected result
- `render` accepts `providers` and `inferProviders`.
- Providers are instantiated dynamically and wrap the component.
- No dead code promising something it does not deliver.

---

## 3. Mocking: export and fix the mockFetchOnce queue

### Problem A: not exported
`src/mocking/fetch-interceptor.ts` is not exported from `src/index.ts`. A consumer cannot do `import { mockFetch } from 'f-react-ui-test'`.

### Change A
Export in `src/index.ts`:

```ts
export { mockFetch, mockFetchOnce, unmockFetch, fetchMock } from './mocking/fetch-interceptor'
```

### Problem B: `mockFetchOnce` queue always rotates to the first item
In `mockFetchOnce`, when a handler already exists for the URL and is an array, the new handler is appended at the end. But the dispatcher (`window.fetch`) matcher always takes `handler[0]`:

```ts
if (Array.isArray(handler)) {
  if (handler.length > 0) {
    const first = handler[0]
    // ...
    response = first
  }
}
```

So "once" never rotates to the next mock.

### Change B
Keep a cursor per URL and advance it after each use:

```ts
const mockCursor = new Map<string, number>()

function matchHandler(url: string): MockResponse | undefined {
  const handler = mockMap.get(url)
  if (!handler) return undefined

  if (Array.isArray(handler)) {
    const cursor = mockCursor.get(url) ?? 0
    const response = handler[cursor]
    // advance cursor, but not beyond the last element
    mockCursor.set(url, Math.min(cursor + 1, handler.length - 1))
    if (typeof response === 'object' && response && 'status' in response) {
      return response
    }
    return undefined
  }

  if (typeof handler === 'function') {
    // resolved async by the caller
    return handler as any
  }

  if (isMockResponse(handler)) return handler
  return undefined
}
```

And in the dispatcher:

```ts
window.fetch = async (input, init) => {
  const request = input instanceof Request ? input : new Request(input, init)
  const url = request.url
  for (const [pattern, handler] of mockMap.entries()) {
    if (matchUrl(pattern, url)) {
      const response = matchHandler(url)
      if (response) {
        if (typeof response === 'function') {
          return createMockResponse(await response(request))
        }
        return createMockResponse(response)
      }
    }
  }
  // fallback to original fetch
}
```

`unmockFetch` must also clear `mockCursor`.

### Expected result
`mockFetchOnce({ '/api/login': [{ status: 401 }, { status: 200 }] })` returns 401 on the first call and 200 on the second.

---

## 4. TestContext actions: implement or delete types

### Problem
`src/types/testing.d.ts` defines `TestContext` with actions `fill`, `click`, `doubleClick`, `rightClick`, `hover`, `unhover`, `select`, `selectOptions`, `check`, `uncheck`, `press`, `type`, `clear`, `upload`. None exist in `src/`. The `describe`/`it` types receive a `context: TestContext`, but the real implementation in `src/vitest-integration.ts` is just a vitest re-export (no context injection).

In short, the types promise an API that does not exist and no caller uses.

### Option A (recommended): implement a minimal set of real actions

Real actions over `screen` + `fireEvent`:

```ts
// src/core/actions.ts
import { fireEvent } from '@testing-library/react'
import { screen } from './render'

export function fill(label: string, value: string, options?: ActionOptions): Promise<void> {
  const el = screen.getByLabelText(label)
  fireEvent.change(el, { target: { value } })
  return Promise.resolve()
}

export function click(textOrRole: string, options?: ActionOptions): Promise<void> {
  let el
  try { el = screen.getByRole('button', { name: textOrRole }) } catch {}
  if (!el) el = screen.getByText(textOrRole)
  fireEvent.click(el)
  return Promise.resolve()
}

export function type(label: string, text: string, options?: ActionOptions): Promise<void> {
  const el = screen.getByLabelText(label)
  const delay = options?.delay ?? 0
  let current = ''
  for (const ch of text) {
    current += ch
    if (delay > 0) await new Promise(r => setTimeout(r, delay))
    fireEvent.change(el, { target: { value: current } })
  }
  return Promise.resolve()
}

export function press(key: string, options?: ActionOptions): Promise<void> {
  fireEvent.keyDown(document.activeElement || document.body, { key })
  return Promise.resolve()
}

// ... select, check, uncheck, clear, upload similarly
```

And export them from `index.ts`. It is not necessary to build the full `TestContext` with nested `screen` if no one consumes it; it is enough that the actions exist as top-level functions.

### Option B: delete the types

Remove the unimplemented actions from `TestContext` and `ExpectAPI` (`fill`, `click`, `type`, etc.), leaving only what actually exists (`screen`, `expect`). Also adjust `DescribeFunction` and `ItFunction` so they do not promise `context`.

### Expected result
- Option A: `fill`, `click`, `type`, `press` exist and can be imported from the library.
- Option B: types do not lie; they only expose what is actually there.

---

## 5. `expect` conflict: explicit alias and document it

### Problem
`src/index.ts` exports two different things called `expect`:

```ts
export { describe, it, test, beforeEach, afterEach, vi } from './vitest-integration'  // vitestExpect
export { expect } from './core/expectations'  // own label-based expect
```

And `src/vitest-entry.ts` overwrites `globalThis.expect` with vitest's.

A consumer importing `expect` from the library cannot use vitest matchers (`.toBeInTheDocument`, `vi.fn`, etc.) nor use the own `expect` consistently.

### Change
Separate clearly:

```ts
// src/index.ts
export { describe, it, test, beforeEach, afterEach, vi } from './vitest-integration'
// own label-based expect, with auto-retry
export { expect } from './core/expectations'
// explicit alias for vitest's expect, if needed
export { expect as vitestExpect } from 'vitest'
```

And document in `README.md` (or in this same `CORRECTIONS.md`):

- `expect` (default): label-based, async, with 5s auto-retry. Example: `await expect.toHaveValue('Email', 'x')`.
- `vitestExpect`: vitest's original expect, for vitest matchers or `expect.extend`.
- `vi`: vitest mocks and spies (re-exported as-is).

### Expected result
No two conflicting `expect`s. The consumer knows which to import for each purpose.

---

## Suggested work order

1. peerDependencies (point 1) — without this nothing else can be installed.
2. Export mocking (point 3A) — quick win.
3. Resolve `expect` conflict (point 5) — avoid breaking existing consumers.
4. Provider-inference: connect or delete (point 2) — choose Option A or B.
5. TestContext actions: implement minimum or delete types (point 4) — choose Option A or B.

Each item deserves its own commit and its own tests before moving to the next.