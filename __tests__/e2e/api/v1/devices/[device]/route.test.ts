import { expect, test } from '@playwright/test'

test.describe('Device', () => {
  test('should get a device', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson['device.serial']).toBe('test1')
  })
})
