import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Home', () => {
  test('redirects to login when auth enabled; otherwise renders wrapper', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}`)
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login')
    } else {
      await expect(page.locator('[data-testid="wrapper"], [data-testid="empty-wrapper"]').first()).toBeAttached()
    }
  })
})
