import { expect, test } from '@playwright/test'

test.describe('Var', () => {
  test('should get var', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/device.serial')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('test1')
  })
})
