import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Home', () => {
  test('renders the index', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}`)
    const grid = await page.$('[data-testid="grid"]')

    expect(grid).toBeDefined()
  })
})
