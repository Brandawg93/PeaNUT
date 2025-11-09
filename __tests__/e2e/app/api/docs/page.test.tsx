import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('API Documentation', () => {
  test('renders the swagger UI', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)
    const swaggerUI = await page.$('.swagger-ui')

    expect(swaggerUI).toBeDefined()
  })

  test('displays API routes in the documentation', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 15000 })

    // Wait for operations to be rendered (Swagger UI takes time to parse and render)
    await page.waitForTimeout(2000)

    // Check for API operations/routes to be displayed
    // The swagger UI should display operations with .opblock class
    const operations = await page.$$('.opblock')

    // Verify that routes are actually displayed (not empty schema)
    expect(operations.length).toBeGreaterThan(0)
  })

  test('displays expected API endpoints', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 15000 })

    // Wait for Swagger to render the content
    await page.waitForTimeout(2000)

    // Check for specific endpoints to be present in the page
    const pageContent = await page.content()

    // Verify key endpoints are documented
    expect(pageContent).toContain('/api/v1/devices')
    expect(pageContent).toContain('/api/v1/version')
    expect(pageContent).toContain('/api/v1/info')
  })

  test('displays API operation tags', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 15000 })

    // Wait for tags to render
    await page.waitForTimeout(2000)

    // Check for operation tags (e.g., Devices, Version, Info)
    const tags = await page.$$('.opblock-tag-section')

    // Verify that tags are displayed for organizing endpoints
    expect(tags.length).toBeGreaterThan(0)
  })

  test('API title and description are displayed', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/api/docs`)

    // Wait for swagger UI to load
    await page.waitForSelector('.swagger-ui', { timeout: 15000 })

    // Wait for content to render
    await page.waitForTimeout(1000)

    const pageContent = await page.content()

    // Verify API information is displayed
    expect(pageContent).toContain('PeaNUT API')
    expect(pageContent).toContain('A Tiny Dashboard for Network UPS Tools')
  })
})
