import { expect, test } from '@playwright/test'

test.describe('Auth', () => {
  test('should handle auth requests', async ({ request }) => {
    const response = await request.get('/api/auth/session')

    expect(response.status()).toBe(200)
  })
})
