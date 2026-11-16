import { useState } from 'react'
import { describe, expect, it } from '../dist'

function Signup() {
  const [name, setName] = useState('')
  return (
    <>
      {/* No <label>: the element can only be found by its placeholder */}
      <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <button aria-label="Create account" onClick={() => setName('created')}>
        Create
      </button>
    </>
  )
}

describe(Signup, (ctx) => {
  it('resolves an input by placeholder when it has no label', async () => {
    await ctx.fill('Full name', 'Ada')

    await expect.toHaveValue('Full name', 'Ada')
  })

  it('clicks a button by its accessible name', async () => {
    await ctx.click('Create account')

    await expect.toHaveValue('Full name', 'created')
  })
})
