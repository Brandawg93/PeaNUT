import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Auth Enabled', () => {
  test('redirects to login when accessing protected routes', async ({ page }) => {
    // Navigate to home page - should redirect to login when auth is enabled
    await page.goto(`http://${hostname}:${port}/`)

    // Should be redirected to login page
    expect(page.url()).toContain('/login')

    // Login page should be rendered
    const container = await page.$('[data-testid="login-wrapper"]')
    expect(container).toBeDefined()
  })

  test('redirects to login when accessing settings', async ({ page }) => {
    // Navigate to settings page - should redirect to login when auth is enabled
    await page.goto(`http://${hostname}:${port}/settings`)

    // Should be redirected to login page
    expect(page.url()).toContain('/login')

    // Login page should be rendered
    const container = await page.$('[data-testid="login-wrapper"]')
    expect(container).toBeDefined()
  })

  test('allows access to login page directly', async ({ page }) => {
    // Navigate directly to login page - should be accessible
    await page.goto(`http://${hostname}:${port}/login`)

    // Should stay on login page (no redirect)
    expect(page.url()).toContain('/login')

    // Login page should be rendered
    const container = await page.$('[data-testid="login-wrapper"]')
    expect(container).toBeDefined()
  })
})
