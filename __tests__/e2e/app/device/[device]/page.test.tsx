import { expect, test } from '@playwright/test'
import { gotoAndCheckAuth } from '../../../utils/page-helpers'

test.describe('Device detail', () => {
  test('renders the device page or redirects to login when auth enabled', async ({ page }) => {
    if (await gotoAndCheckAuth(page, '/device/ups')) return

    // The `ups` device is always seeded by the docker-compose NUT fixture, so assert the
    // populated wrapper specifically — accepting `empty-wrapper` here would let a broken
    // device request pass silently.
    await expect(page.locator('[data-testid="wrapper"]')).toBeAttached()
  })
})
