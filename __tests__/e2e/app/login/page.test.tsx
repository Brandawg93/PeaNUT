import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Login', () => {
  test('renders the login page or redirects to setup', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/login`)
    const currentUrl = page.url()
    if (currentUrl.includes('/setup')) {
      // When no user exists, login redirects to setup
      expect(currentUrl).toContain('/setup')
    } else {
      await expect(page.locator('[data-testid="login-wrapper"]')).toBeAttached()
    }
  })
})
