import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('API Documentation', () => {
  test('renders the swagger UI', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)
    await expect(page.locator('.swagger-ui')).toBeAttached()
  })

  test('displays API routes in the documentation', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load and render operations
    await page.locator('.swagger-ui').waitFor({ timeout: 15000 })
    await expect(page.locator('.opblock').first()).toBeVisible({ timeout: 10000 })
  })

  test('displays expected API endpoints', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load and render
    await page.locator('.swagger-ui').waitFor({ timeout: 15000 })
    await expect(page.locator('.opblock').first()).toBeVisible({ timeout: 10000 })

    // Verify key endpoints are documented
    const pageContent = await page.content()
    expect(pageContent).toContain('/api/v1/devices')
    expect(pageContent).toContain('/api/v1/version')
    expect(pageContent).toContain('/api/v1/info')
  })

  test('displays API operation tags', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load and render tags
    await page.locator('.swagger-ui').waitFor({ timeout: 15000 })
    await expect(page.locator('.opblock-tag-section').first()).toBeVisible({ timeout: 10000 })
  })

  test('API title and description are displayed', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load and render operations (ensures content is ready)
    await page.locator('.swagger-ui').waitFor({ timeout: 15000 })
    await expect(page.locator('.opblock').first()).toBeVisible({ timeout: 10000 })

    // Verify API information is present in the page content
    const pageContent = await page.content()
    expect(pageContent).toContain('PeaNUT API')
    expect(pageContent).toContain('A Tiny Dashboard for Network UPS Tools')
  })
})
