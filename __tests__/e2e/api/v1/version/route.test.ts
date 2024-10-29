import { expect, test } from '@playwright/test'

test.describe('Version', () => {
  test('should get version', async ({ request }) => {
    const create = await request.get('/api/v1/version')
    const createText = await create.text()

    expect(create.status()).toBe(200)
    expect(createText).toContain('Network UPS Tools')
  })
})
