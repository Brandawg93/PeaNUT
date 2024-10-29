import { expect, test } from '@playwright/test'

test.describe('Devices', () => {
  test('should get devices', async ({ request }) => {
    const create = await request.get('/api/v1/version')
    const createText = await create.text()

    expect(create.status()).toBe(200)
    expect(createText).toContain('Network UPS Tools')
  })
})
