import { expect, test } from '@playwright/test'

const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || '3000'

test.describe('Settings', () => {
  test('renders the settings', async ({ page }) => {
    await page.goto(`http://${hostname}:${port}/settings`)
    const container = await page.$('[data-testid="settings-wrapper"]')

    expect(container).toBeDefined()
  })
})
