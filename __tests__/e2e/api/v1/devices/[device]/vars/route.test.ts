import { expect, test } from '@playwright/test'

test.describe('Vars', () => {
  test('should get vars', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/vars')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson['device.serial'].value).toBe('test1')
  })
})
