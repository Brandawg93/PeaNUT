import { expect, test } from '@playwright/test'

test.describe('Command', () => {
  test('should run command', async ({ request }) => {
    const create = await request.post('/api/v1/devices/ups/command/driver.reload')
    const text = await create.text()

    expect(create.status()).toBe(200)
    expect(text).toBe('"Command driver.reload on device ups run successfully"')
  })
})
