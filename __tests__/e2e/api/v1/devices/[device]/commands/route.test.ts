import { expect, test } from '@playwright/test'

test.describe('Commands', () => {
  test('should get commands', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/commands')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toContain('driver.reload')
  })
})
