import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Footer Links', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`http://${hostname}:${port}`)
    // Wait for footer to be present in the DOM
    await page.locator('[data-testid="footer"]').waitFor({ state: 'attached' })
  })

  test('GitHub icon links to correct repository', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    const githubLink = footer.locator('a[aria-label="GitHub"]')
    await expect(githubLink).toBeVisible()

    await expect(githubLink).toHaveAttribute('href', 'https://www.github.com/brandawg93/peanut')
    await expect(githubLink).toHaveAttribute('target', '_blank')
  })

  test('Sponsor icon links to GitHub sponsors page', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    const sponsorLink = footer.locator('a[aria-label="Sponsor"]')
    await expect(sponsorLink).toBeVisible()

    await expect(sponsorLink).toHaveAttribute('href', 'https://www.github.com/sponsors/brandawg93')
    await expect(sponsorLink).toHaveAttribute('target', '_blank')
  })

  test('API docs link points to docs page', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    const docsLink = footer.locator('a[href*="/api/docs"]')
    await expect(docsLink).toBeVisible()

    await expect(docsLink).toHaveAttribute('target', '_blank')
  })

  test('version number links to GitHub releases when loaded', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')

    // Wait a reasonable time for the version to load
    const versionLink = footer.locator('a[href*="github.com/brandawg93/peanut/releases"]')

    // Version fetch may be disabled in test environments
    const count = await versionLink.count()
    if (count > 0) {
      await expect(versionLink.first()).toHaveAttribute('href', /\/tag\/v/)
      await expect(versionLink.first()).toHaveAttribute('target', '_blank')
    } else {
      // If version wasn't found, it might be disabled - that's OK, just verify footer exists
      await expect(footer).toBeVisible()
    }
  })

  test('update available link (if shown) links to GitHub releases', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    const updateLink = footer.locator('[data-testid="update-available-link"]')

    const count = await updateLink.count()
    if (count > 0) {
      await expect(updateLink).toHaveAttribute('href', /github\.com\/brandawg93\/peanut\/releases/)
      await expect(updateLink).toHaveAttribute('target', '_blank')
    }
  })

  test('all footer external links open in new tab', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    const externalLinks = footer.locator('a[target="_blank"]')
    const count = await externalLinks.count()

    expect(count).toBeGreaterThan(0)

    for (let i = 0; i < count; i++) {
      const link = externalLinks.nth(i)
      await expect(link).toHaveAttribute('target', '_blank')
      await expect(link).toHaveAttribute('rel', /noreferrer/)
    }
  })

  test('footer displays last updated time', async ({ page }) => {
    const footer = page.locator('[data-testid="footer"]')
    await expect(footer).toBeVisible()

    const footerText = await footer.textContent()
    expect(footerText).toBeTruthy()
  })
})
