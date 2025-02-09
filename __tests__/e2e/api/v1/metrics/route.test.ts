import { expect, test } from '@playwright/test'

test.describe('Metrics', () => {
  test('should get devices', async ({ request }) => {
    const create = await request.get('/api/v1/metrics')

    expect(create.status()).toBe(200)
    expect(create.headers()['content-type']).toBe('text/plain; version=0.0.4')
  })
})
