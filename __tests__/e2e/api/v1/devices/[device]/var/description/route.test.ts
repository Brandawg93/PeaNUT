import { expect, test } from '@playwright/test'

test.describe('Var Description', () => {
  test('should get var description', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/var/device.serial/description')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('Device serial number')
  })
})
