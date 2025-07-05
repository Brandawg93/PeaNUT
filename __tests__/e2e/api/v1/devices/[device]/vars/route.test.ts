import { expect, test } from '@playwright/test'

test.describe('Vars', () => {
  test('should get vars', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/vars')
    const createJson = (await create.json()) as Record<string, any>

    expect(create.status()).toBe(200)
    expect(createJson['device.serial']).toBe('test1')
  })
})
