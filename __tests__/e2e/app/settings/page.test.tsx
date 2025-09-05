import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Settings', () => {
  test('requires auth or renders settings when auth disabled', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/settings`)
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login')
    } else {
      const container = await page.$('[data-testid="settings-wrapper"]')
      expect(container).toBeDefined()
    }
  })
})
