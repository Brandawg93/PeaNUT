import { expect, test } from '@playwright/test'

test.describe('Clients', () => {
  test('should get clients', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/clients')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toHaveLength(1)
  })
})
