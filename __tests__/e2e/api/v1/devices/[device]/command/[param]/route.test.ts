import { expect, test } from '@playwright/test'

test.describe('Command Param', () => {
  test('should execute command', async ({ request }) => {
    const create = await request.post('/api/v1/devices/ups/command/driver.reload')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(typeof createJson).toBe('string')
  })
})
