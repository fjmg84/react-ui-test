// UI Testing Actions  
// Minimal real actions over screen + fireEvent, wrapped in act to silence React warnings.

import { act } from 'react-dom/test-utils'
import { fireEvent } from '@testing-library/react'
import { screen } from './render'
import { getElementByLabel } from './expectations'

export async function fill(label: string, value: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.change(el as HTMLInputElement, { target: { value } })
  })
}

export async function click(textOrRole: string): Promise<void> {
  await act(async () => {
    let el: HTMLElement | null = null
    try {
      el = screen.getByRole('button', { name: textOrRole })
    } catch {}
    if (!el) {
      try { el = screen.getByText(textOrRole) } catch {}
    }
    if (!el) throw new Error(`No element found for: "${textOrRole}"`)
    fireEvent.click(el)
  })
}

export async function type(label: string, text: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    let current = ''
    for (const ch of text) {
      current += ch
      fireEvent.change(el as HTMLInputElement, { target: { value: current } })
    }
  })
}

export async function clear(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.change(el as HTMLInputElement, { target: { value: '' } })
  })
}

export async function press(key: string): Promise<void> {
  await act(async () => {
    fireEvent.keyDown(document.activeElement || document.body, { key })
  })
}

export async function check(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.click(el as HTMLInputElement)
  })
}

export async function uncheck(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.click(el as HTMLInputElement)
  })
}

export async function select(label: string, value: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.change(el as HTMLSelectElement, { target: { value } })
  })
}

export async function selectOptions(label: string, values: string[]): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.change(el as HTMLSelectElement, { target: { values } })
  })
}

export async function hover(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.mouseOver(el)
  })
}

export async function unhover(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.mouseOut(el)
  })
}

export async function doubleClick(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.dblClick(el)
  })
}

export async function rightClick(label: string): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.contextMenu(el)
  })
}

export async function upload(label: string, files: File[]): Promise<void> {
  await act(async () => {
    const el = getElementByLabel(label)
    fireEvent.change(el as HTMLInputElement, { target: { files } })
  })
}

export { fireEvent }
