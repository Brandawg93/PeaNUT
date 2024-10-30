import { expect, test } from '@playwright/test'

test.describe('Netversion', () => {
  test('should get net version', async ({ request }) => {
    const create = await request.get('/api/v1/netversion')
    const createText = await create.text()

    expect(create.status()).toBe(200)
    expect(createText).toContain('1.3')
  })
})
