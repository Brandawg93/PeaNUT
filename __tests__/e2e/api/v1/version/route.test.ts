import { expect, test } from '@playwright/test'

test.describe('Version', () => {
  test('should get version', async ({ request }) => {
    const req = await request.get('/api/v1/version')
    const json = await req.json()

    expect(req.status()).toBe(200)
    expect(json[0]).toContain('Network UPS Tools')
  })
})
