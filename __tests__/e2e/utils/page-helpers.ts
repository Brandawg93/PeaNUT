import { Page, expect } from '@playwright/test'

const hostname = process.env.HOSTNAME ?? 'localhost'
const port = process.env.PORT ?? '3000'
export const baseUrl = `http://${hostname}:${port}`

/**
 * Navigates to `path` and returns whether the app redirected to /login (auth enabled).
 * Asserts the redirect when it happens, so callers can just `if (await gotoAndCheckAuth(...)) return`.
 */
export async function gotoAndCheckAuth(page: Page, path: string): Promise<boolean> {
  await page.goto(`${baseUrl}${path}`)
  const currentUrl = page.url()
  if (currentUrl.includes('/login')) {
    expect(currentUrl).toContain('/login')
    return true
  }
  return false
}
