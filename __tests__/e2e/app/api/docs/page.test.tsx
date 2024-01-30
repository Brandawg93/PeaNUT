import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || '3000'

test.describe('Docs', () => {
  test('renders the docs', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)
    const heading = await page.$('.swagger-ui')

    expect(heading).toBeDefined()
  })
})
