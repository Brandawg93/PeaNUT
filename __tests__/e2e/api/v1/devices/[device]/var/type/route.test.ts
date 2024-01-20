import { expect, test } from '@playwright/test'

test.describe('Var Type', () => {
  test('should get var type', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/battery.charge.low/type')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('RW NUMBER')
  })
})
