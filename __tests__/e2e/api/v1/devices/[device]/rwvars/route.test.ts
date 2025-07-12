import { expect, test } from '@playwright/test'

test.describe('RwVars', () => {
  test('should get rwvars', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/rwvars')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(Array.isArray(createJson)).toBe(true)
  })
})
