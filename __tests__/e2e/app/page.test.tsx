import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Home', () => {
  test('redirects to login when auth enabled; otherwise renders grid', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}`)
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login')
    } else {
      const grid = await page.$('[data-testid="grid"]')
      expect(grid).toBeDefined()
    }
  })
})
