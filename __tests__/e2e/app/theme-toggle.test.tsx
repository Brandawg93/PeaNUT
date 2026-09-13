import { expect, test } from '@playwright/test'
import { gotoAndCheckAuth } from '../utils/page-helpers'

test.describe('Theme toggle', () => {
  test('switches the resolved theme when a new option is selected', async ({ page }) => {
    if (await gotoAndCheckAuth(page, '/')) return

    const trigger = page.locator('[data-testid="daynight-trigger"]')
    await expect(trigger).toBeAttached()

    // Hidden below the `sm` breakpoint, so skip the interaction on narrower (mobile) viewports
    // rather than silently passing without exercising it.
    test.skip(!(await trigger.isVisible()), 'daynight trigger is hidden below the sm breakpoint')

    await trigger.click()
    await page.getByRole('menuitem', { name: 'Dark' }).click()

    await expect(page.locator('html')).toHaveClass(/dark/)
  })
})
