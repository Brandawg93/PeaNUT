import { expect, test } from '@playwright/test'

test.describe('Description', () => {
  test('should get description', async ({ request }) => {
    const create = await request.get('/api/v1/devices/ups/description')
    const createJson = await create.json()

    expect(create.status()).toBe(200)
    expect(createJson).toBe('CPS Test')
  })
})
