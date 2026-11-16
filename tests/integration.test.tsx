// UI Tests for f-react-ui-test  
// Usa la API de la librería: render, screen, fireEvent y expect (label-based).

import { render, screen, fireEvent, expect } from 'f-react-ui-test'
import LoginForm from './fixtures/LoginForm'

describe('LoginFormsS', () => {
  it('permite llenar credenciales y hacer click en login', async () => {
    render(<LoginForm />)

    await fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' }
    })
    await fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret123' }
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await expect.toHaveValue('Email', 'user@test.com')
    await expect.toHaveValue('Contraseña', 'secret123')
  })

  it('muestra error cuando login falla', async () => {
    render(<LoginForm onLogin={() => Promise.reject(new Error('fail'))} />)

    await fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'wrong@test.com' }
    })
    await fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'wrong' }
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await expect.toSee('Credenciales inválidas')
  })

  it('deshabilita inputs durante loading', async () => {
    let resolveLogin: () => void
    const loginPromise = new Promise<void>((res) => {
      resolveLogin = res
    })

    render(<LoginForm onLogin={() => loginPromise} />)

    await fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'user@test.com' }
    })
    await fireEvent.change(screen.getByLabelText('Contraseña'), {
      target: { value: 'secret123' }
    })
    await fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    // Input deshabilitado mientras se espera la respuesta
    await expect.toBeDisabled('Email')

    resolveLogin()
    await expect.toBeEnabled('Email')
  })

  it('valida campos requeridos', async () => {
    render(<LoginForm />)

    await fireEvent.click(screen.getByRole('button', { name: 'Iniciar sesión' }))

    await expect.toBeInvalid('Email')
    await expect.toBeInvalid('Contraseña')
  })
})
