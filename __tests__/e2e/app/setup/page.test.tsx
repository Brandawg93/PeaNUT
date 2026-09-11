import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Setup', () => {
  test('renders the initial admin setup form or redirects to login when a user already exists', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/setup`)
    const currentUrl = page.url()
    if (currentUrl.includes('/login')) {
      expect(currentUrl).toContain('/login')
    } else {
      await expect(page.locator('#username')).toBeAttached()
      await expect(page.locator('#password')).toBeAttached()
    }
  })
})
