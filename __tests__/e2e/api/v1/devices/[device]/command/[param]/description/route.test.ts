import { expect, test } from '@playwright/test'

test.describe('Command Description', () => {
  test('should get command description', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/command/test.command/description')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(typeof createJson).toBe('string')
  })
})
