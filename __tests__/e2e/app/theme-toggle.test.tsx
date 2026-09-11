import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'

test.describe('Theme toggle', () => {
  test('switches the resolved theme when a new option is selected', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/`)
    if (page.url().includes('/login')) {
      return
    }

    const trigger = page.locator('[data-testid="daynight-trigger"]')
    await expect(trigger).toBeAttached()

    // Hidden below the `sm` breakpoint, so only exercise the interaction on wider viewports.
    if (!(await trigger.isVisible())) {
      return
    }

    await trigger.click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()

    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
