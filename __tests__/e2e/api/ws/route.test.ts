import { expect, test } from '@playwright/test'

test.describe('WebSocket', () => {
  test('should handle websocket connection', async ({ request }) => {
    const response = await request.get('/api/ws')

    expect(response.status()).toBe(426) // WebSocket upgrade status
  })
})
