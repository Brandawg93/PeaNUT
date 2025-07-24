import { expect, test } from '@playwright/test'

test.describe('Var Range', () => {
  test('should get var range', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/battery.charge/range')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(Array.isArray(createJson)).toBe(true)
  })
})
