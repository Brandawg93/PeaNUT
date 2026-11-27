import { expect, test } from '@playwright/test'
import { gotoAndCheckAuth } from '../../utils/page-helpers'

test.describe('Setup', () => {
  test('renders the initial admin setup form or redirects to login when a user already exists', async ({ page }) => {
    if (await gotoAndCheckAuth(page, '/setup')) return

    await expect(page.locator('#username')).toBeAttached()
    await expect(page.locator('#password')).toBeAttached()
  })
})
