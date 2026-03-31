import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Auth Enabled', () => {
  test('redirects to login when accessing protected routes', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/`)

    expect(page.url()).toContain('/login')
    await expect(page.locator('[data-testid="login-wrapper"]')).toBeAttached()
  })

  test('redirects to login when accessing settings', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/settings`)

    expect(page.url()).toContain('/login')
    await expect(page.locator('[data-testid="login-wrapper"]')).toBeAttached()
  })

  test('allows access to login page directly', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/login`)

    expect(page.url()).toContain('/login')
    await expect(page.locator('[data-testid="login-wrapper"]')).toBeAttached()
  })
})
