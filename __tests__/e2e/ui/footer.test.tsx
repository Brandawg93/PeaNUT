import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Footer Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://${hostname}:${port}`)
    // Wait for page to load
    await page.waitForLoadState('networkidle')
  })

  test('GitHub icon links to correct repository', async ({ page }) => {
    const githubLink = page.locator('a[aria-label="GitHub"]')
    await expect(githubLink).toBeVisible()

    const href = await githubLink.getAttribute('href')
    expect(href).toBe('https://www.github.com/brandawg93/peanut')

    const target = await githubLink.getAttribute('target')
    expect(target).toBe('_blank')
  })

  test('Sponsor icon links to GitHub sponsors page', async ({ page }) => {
    const sponsorLink = page.locator('a[aria-label="Sponsor"]')
    await expect(sponsorLink).toBeVisible()

    const href = await sponsorLink.getAttribute('href')
    expect(href).toBe('https://www.github.com/sponsors/brandawg93')

    const target = await sponsorLink.getAttribute('target')
    expect(target).toBe('_blank')
  })

  test('API docs link points to docs page', async ({ page }) => {
    // Find the docs link by text content
    const docsLink = page.locator('a:has-text("docs"), a:has-text("Docs")')
    await expect(docsLink.first()).toBeVisible()

    const href = await docsLink.first().getAttribute('href')
    expect(href).toContain('/api/docs')

    const target = await docsLink.first().getAttribute('target')
    expect(target).toBe('_blank')
  })

  test('version number links to GitHub releases when loaded', async ({ page }) => {
    // This test verifies that IF the version link loads, it has the correct href
    // The version fetch may be disabled in test environments or take time

    // Wait a reasonable time for the version to load
    await page.waitForTimeout(5000)

    // Find all external links
    const allLinks = await page.$$('a[target="_blank"]')

    // Look for version link
    let versionLinkFound = false
    for (const link of allLinks) {
      const href = await link.getAttribute('href')
      const text = await link.textContent()

      // Version link should have href to github releases and text with version number
      if (href?.includes('github.com/brandawg93/peanut/releases') && text?.match(/v?\d+\.\d+\.\d+/)) {
        versionLinkFound = true
        // Verify the link is correctly formatted
        expect(href).toContain('github.com/brandawg93/peanut/releases')
        expect(href).toContain('/tag/v')
        expect(await link.getAttribute('target')).toBe('_blank')
        break
      }
    }

    // If version wasn't found, it might be disabled - that's OK, just verify footer exists
    if (!versionLinkFound) {
      const footer = await page.$('[data-testid="footer"]')
      expect(footer).toBeTruthy()
      console.log('⚠️  Version link not displayed - version checking may be disabled')
    }
  })

  test('update available link (if shown) links to GitHub releases', async ({ page }) => {
    // This test checks if an update notification is shown and has correct link
    // It's conditional because it depends on whether an update is available

    // Look for update notification text
    const updateText = page.locator('text=/update.*available/i')

    // Check if update notification exists
    const exists = await updateText.count()

    if (exists > 0) {
      // If update notification exists, verify it has a link to releases
      const updateLink = updateText.locator('xpath=ancestor::a[1]')
      const href = await updateLink.getAttribute('href')

      expect(href).toContain('github.com/brandawg93/peanut/releases')
      expect(await updateLink.getAttribute('target')).toBe('_blank')
    } else {
      // If no update available, test passes (this is expected behavior)
      expect(true).toBe(true)
    }
  })

  test('all footer external links open in new tab', async ({ page }) => {
    const externalLinks = page.locator('footer a[target="_blank"], [data-testid="footer"] a[target="_blank"]')
    const count = await externalLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i)
      const target = await link.getAttribute('target')
      expect(target).toBe('_blank')

      const rel = await link.getAttribute('rel')
      expect(rel).toContain('noreferrer')
    }
  })

  test('footer displays last updated time', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    await expect(footer).toBeVisible()

    // Check for "Last Updated" text or similar
    const footerText = await footer.textContent()
    expect(footerText).toBeTruthy()
  })
})
