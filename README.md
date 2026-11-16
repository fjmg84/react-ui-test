# @fjmg84/uitest

A zero-config React UI testing library for Vitest. It wraps React Testing Library so you can
describe a component instead of a test setup, drive it through a small action API, and assert on
what the user actually sees — by accessible label, not by test id.

```ts
describe(LoginForm, (ctx) => {
  it('fills the credentials and logs in', async () => {
    await ctx.fill('Email', 'user@test.com')
    await ctx.fill('Password', 'secret123')
    await ctx.click('Sign in')

    await expect.toHaveValue('Email', 'user@test.com')
  })
})
```

- **No boilerplate** — the component is mounted before each test and unmounted after it.
- **Label-first** — elements are resolved the way a user finds them: label, placeholder, role, test id.
- **Auto-retrying assertions** — every assertion polls until it holds (3 s default), so no `waitFor` boilerplate.
- **No silent passes** — an assertion that is started but never awaited still fails the test.

## Installation

```bash
npm install --save-dev @fjmg84/uitest
```

Peer dependencies (you provide them): `react` >= 18, `react-dom` >= 18, `@testing-library/react` >= 16,
`@testing-library/dom` >= 10, `vitest` >= 2.

## Setup

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom', // or 'jsdom'
    globals: true,
  },
})
```

Then import from the package:

```ts
import { describe, expect, it } from '@fjmg84/uitest'
```

`describe` is overloaded: `describe(Component, (ctx) => …)` mounts the component, while
`describe('some group name', () => …)` is delegated to Vitest unchanged.

## Example: Counter

The examples below are the real test files in [`tests/`](./tests).

### With `@fjmg84/uitest`

```tsx
// tests/counter.test.tsx
import { describe, expect, it } from "@fjmg84/uitest";
import Counter from "./fixtures/Counter";

describe(Counter, (ctx) => {
  it("should render the component, displaying the items.", async () => {
    await expect.toSee("Counter Test");
    await expect.toSee("+");
    await expect.toSee("-");
    await expect.toSee("0");
  });

  it("the value of value should change if you click on the action buttons", async () => {
    ctx.click("+");
    await expect.toSee("1");
    ctx.click("+");
    await expect.toSee("2");
    ctx.click("+");
    await expect.toSee("3");
    ctx.click("-");
    await expect.toSee("2");
  });

  it("if value equal 0, it does not allow you to continue subtracting values from the value", async () =>{
    ctx.click("-")
    await expect.toSee("0")
  })
});
```

### The same test without the library

```tsx
// tests/counter.test.tsx (plain React Testing Library + Vitest)
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import Counter from './fixtures/Counter'

describe('Counter', () => {
  afterEach(() => cleanup())

  it('should render the component, displaying the items.', () => {
    render(<Counter />)

    expect(screen.getByText('Counter Test')).toBeTruthy()
    expect(screen.getByRole('button', { name: '+' })).toBeTruthy()
    expect(screen.getByRole('button', { name: '-' })).toBeTruthy()
    expect(screen.getByText('0')).toBeTruthy()
  })

  it('the value of value should change if you click on the action buttons', () => {
    render(<Counter />)

    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('1')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('2')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '+' }))
    expect(screen.getByText('3')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: '-' }))
    expect(screen.getByText('2')).toBeTruthy()
  })

  it('if value equal 0, it does not allow you to continue subtracting values from the value', () => {
    render(<Counter />)

    fireEvent.click(screen.getByRole('button', { name: '-' }))
    expect(screen.getByText('0')).toBeTruthy()
  })
})
```

## Example: LoginForm

### With `@fjmg84/uitest`

```tsx
// tests/loginForm.test.tsx
import { describe, expect } from "@fjmg84/uitest";
import { LoginForm } from "./fixtures/LoginForm";

describe(LoginForm, (ctx) => {
  it("permite llenar credenciales y hacer click en login", async () => {
    await ctx.fill("Email", "user@test.com");
    await ctx.fill("Contraseña", "secret123");
    await ctx.click("Iniciar sesión");

    await expect.toHaveValue("Email", "user@test.com");
    await expect.toHaveValue("Contraseña", "secret123");
  });

  it("muestra error cuando login falla", async () => {
    ctx.render({ onLogin: () => Promise.reject(new Error("fail")) });

    await ctx.fill("Email", "wrong@test.com");
    await ctx.fill("Contraseña", "wrong");
    await ctx.click("Iniciar sesión");

    await expect.toSee("Credenciales inválidas");
  });

  it("deshabilita inputs durante loading", async () => {
    let resolveLogin!: () => void;
    const loginPromise = new Promise<void>((res) => {
      resolveLogin = res;
    });

    ctx.render({ onLogin: () => loginPromise });

    await ctx.fill("Email", "user@test.com");
    await ctx.fill("Contraseña", "secret123");
    await ctx.click("Iniciar sesión");

    await expect.toBeDisabled("Email");

    resolveLogin();
    await expect.toBeEnabled("Email");
  });

  it("valida campos requeridos", async () => {
    await ctx.click("Iniciar sesión");

    await expect.toBeInvalid("Email");
    await expect.toBeInvalid("Contraseña");
  });
});
```

### The same test without the library

```tsx
// tests/loginForm.test.tsx (plain React Testing Library + Vitest)
import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { LoginForm } from './fixtures/LoginForm'

describe('LoginForm', () => {
  afterEach(() => cleanup())

  it('permite llenar credenciales y hacer click en login', async () => {
    const onLogin = vi.fn().mockResolvedValue(undefined)
    render(<LoginForm onLogin={onLogin} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect((screen.getByLabelText('Email') as HTMLInputElement).value).toBe('user@test.com')
      expect((screen.getByLabelText('Contraseña') as HTMLInputElement).value).toBe('secret123')
    })
  })

  it('muestra error cuando login falla', async () => {
    render(<LoginForm onLogin={() => Promise.reject(new Error('fail'))} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'wrong@test.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'wrong' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect(screen.getByRole('alert').textContent).toContain('Credenciales inválidas')
    })
  })

  it('deshabilita inputs durante loading', async () => {
    let resolveLogin!: () => void
    const loginPromise = new Promise<void>((res) => {
      resolveLogin = res
    })
    render(<LoginForm onLogin={() => loginPromise} />)

    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'user@test.com' } })
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'secret123' } })
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect((screen.getByLabelText('Email') as HTMLInputElement).disabled).toBe(true)
    })

    resolveLogin()

    await waitFor(() => {
      expect((screen.getByLabelText('Email') as HTMLInputElement).disabled).toBe(false)
    })
  })

  it('valida campos requeridos', async () => {
    render(<LoginForm />)

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await waitFor(() => {
      expect((screen.getByLabelText('Email') as HTMLInputElement).checkValidity()).toBe(false)
      expect((screen.getByLabelText('Contraseña') as HTMLInputElement).checkValidity()).toBe(false)
    })
  })
})
```

## What changes in practice

| Plain RTL + Vitest | `@fjmg84/uitest` |
| --- | --- |
| `render(<C />)` plus `cleanup()` in `afterEach` | `describe(C, (ctx) => …)` mounts and unmounts for you |
| `screen.getByLabelText('Email')` + `fireEvent.change(…)` | `await ctx.fill('Email', '…')` |
| `screen.getByRole('button', { name: 'X' })` + `fireEvent.click(…)` | `await ctx.click('X')` |
| `waitFor(() => expect(el.value).toBe('x'))` | `await expect.toHaveValue('Email', 'x')` |
| `expect(screen.getByText('x')).toBeTruthy()` | `await expect.toSee('x')` (auto-retry) |
| `act()` wrapping by hand, act warnings | every action is act-wrapped |
| a forgotten `await` can pass silently | a forgotten `await` still fails the test |

> **Note** — actions are async, so `await ctx.click('…')` is the correct form. The auto-retry in
> `expect` can mask a missing `await`, which is why the examples above still pass without it.

## API

### `describe(component, (ctx) => …)`

Mounts `component` before every test in the block and unmounts it afterwards. The block title
defaults to `component.displayName || component.name`. A base `props` object can be passed as a
second argument: `describe(C, { props: { role: 'admin' } }, (ctx) => { … })`.

### `ctx`

| Member | Description |
| --- | --- |
| `ctx.render(props?)` | Re-render the component with merged props (useful to change behaviour mid-test). |
| `ctx.screen` | The Testing Library `screen`, for queries the library does not cover. |
| `ctx.expect` | The same assertion API as the exported `expect`. |
| `ctx.fill(label, value)` | Set the value of an input. |
| `ctx.type(label, text)` | Type text into an input character by character. |
| `ctx.clear(label)` | Empty an input. |
| `ctx.click(textOrRole)` | Click a button by its accessible name, falling back to its text. |
| `ctx.doubleClick(label)` / `ctx.rightClick(label)` | Alternative mouse buttons. |
| `ctx.hover(label)` / `ctx.unhover(label)` | Pointer enter / leave. |
| `ctx.check(label)` / `ctx.uncheck(label)` | Toggle a checkbox or radio. |
| `ctx.select(label, value)` / `ctx.selectOptions(label, values)` | Choose options in a `<select>`. |
| `ctx.press(key)` | Dispatch a keydown on the focused element. |
| `ctx.upload(label, files)` | Attach files to a file input. |

Elements are resolved by label first, then placeholder, then role name, then test id.

### `expect`

All assertions are async and retry until they hold (3000 ms by default, override with
`{ timeout }`).

| Assertion | Description |
| --- | --- |
| `await expect.toSee(text)` | Some element shows `text`. |
| `await expect.notToSee(text)` | No element shows `text`. |
| `await expect.toHaveValue(label, value)` | The labelled input holds `value`. |
| `await expect.toBeDisabled(label)` / `toBeEnabled(label)` | Disabled state of the labelled element. |
| `await expect.toBeChecked(label)` / `toBeUnchecked(label)` | Checked state of the labelled input. |
| `await expect.toBeValid(label)` / `toBeInvalid(label)` | HTML constraint validation of the labelled input. |
| `await expect.toHaveAttribute(label, attr, value?)` | The labelled element has the attribute (with that value). |
| `await expect.toHaveClass(label, className)` | The labelled element has the class. |
| `await expect.urlToBe(url)` / `urlToContain(sub)` / `urlToMatch(pattern)` | Assertions on `window.location`. |
| `await expect.element(label).toSee(text)` | The same assertions scoped to one element. |

## Not available yet

These are known gaps, tracked in [`CORRECTIONS.md`](./CORRECTIONS.md). Do not rely on them yet:

- **Provider inference** — `configureProviders()` and automatic provider wrapping are not wired into
  `render` yet, so a component that needs a router or a query client still has to be wrapped by
  hand. Until then use React Testing Library's `render` with a `wrapper` option.
- **Fetch mocking** — `mockFetch`, `mockFetchOnce` and `unmockFetch` are implemented in the source
  tree but are not exported from the package entry point yet.
- **Vitest's `expect`** — the package exports its own label-based `expect`. Vitest's `expect` is not
  re-exported under a separate alias yet, so import it from `vitest` directly when you need
  Vitest matchers.
- **Action options** — the actions accept no options yet (no per-action timeout or typing delay).

## License

MIT
