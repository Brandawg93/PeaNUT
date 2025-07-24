import { expect, test } from '@playwright/test'

test.describe('Netversion', () => {
  test('should get net version', async ({ request }) => {
    const req = await request.get('/api/v1/netversion')
    const json = (await req.json()) as string[]

    expect(req.status()).toBe(200)
    expect(json[0]).toBe('1.3')
  })
})
