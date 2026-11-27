import { expect, test } from '@playwright/test'
import { gotoAndCheckAuth } from '../utils/page-helpers'

test.describe('Language switcher', () => {
  test('switches the UI language when a new option is selected', async ({ page }) => {
    if (await gotoAndCheckAuth(page, '/')) return

    const trigger = page.locator('[data-testid="language-trigger"]')
    await expect(trigger).toBeAttached()

    // Hidden below the `sm` breakpoint, so skip the interaction on narrower (mobile) viewports
    // rather than silently passing without exercising it.
    test.skip(!(await trigger.isVisible()), 'language trigger is hidden below the sm breakpoint')

    await trigger.click()
    await page.getByRole('menuitem', { name: 'Deutsch' }).click()

    await expect(page.getByTitle('Einstellungen').first()).toBeVisible()
  })
})
