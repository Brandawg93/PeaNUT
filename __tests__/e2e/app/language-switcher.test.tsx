import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Language switcher', () => {
  test('switches the UI language when a new option is selected', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/`)
    if (page.url().includes('/login')) {
      return
    }

    const trigger = page.locator('[data-testid="language-trigger"]')
    await expect(trigger).toBeAttached()

    // Hidden below the `sm` breakpoint, so only exercise the interaction on wider viewports.
    if (!(await trigger.isVisible())) {
      return
    }

    await trigger.click()
    await page.getByRole('menuitem', { name: 'Deutsch' }).click()

    await expect(page.getByTitle('Einstellungen').first()).toBeVisible()
  })
})
