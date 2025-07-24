import { expect, test } from '@playwright/test'

test.describe('Var Enum', () => {
  test('should get var enum', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/ups.type/enum')
    const createJson = await create.json()

    expect(create.status()).toBe(404)
    expect(createJson).toBe(`Parameter ups.type on device ups not found`)
  })
})
