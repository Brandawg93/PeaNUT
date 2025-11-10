import { defineConfig, devices } from '@playwright/test'
import path from 'path'

// Use process.env.PORT by default and fallback to port 3000
const PORT = process.env.PORT ?? 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

// Reference: https://playwright.dev/docs/test-configuration
export default defineConfig({
  // Timeout per test
  timeout: 30 * 1000,
  // Test directory
  testDir: path.join(__dirname, '__tests__/e2e'),
  // If a test fails, retry it additional 3 times
  retries: 3,
  // Artifacts folder where screenshots, videos, and traces are stored.
  outputDir: 'test-results/',
  // Run all tests in parallel.
  fullyParallel: true,

  // Run your local dev server before starting the tests:
  // https://playwright.dev/docs/test-advanced#launching-a-development-web-server-during-the-tests
  webServer: {
    command: 'pnpm run dev:next',
    url: baseURL,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
  },

  use: {
    // Use baseURL so to make navigations relative.
    // More information: https://playwright.dev/docs/api/class-testoptions#test-options-base-url
    baseURL,

    // Retry a test if its failing with enabled tracing. This allows you to analyze the DOM, console logs, network traffic etc.
    // More information: https://playwright.dev/docs/trace-viewer
    trace: 'retry-with-trace',

    // All available context options: https://playwright.dev/docs/api/class-browser#browser-new-context
    // contextOptions: {
    //   ignoreHTTPSErrors: true,
    // },
  },

  projects: [
    // Only include Auth Enabled project when auth environment variables are set
    ...(process.env.WEB_USERNAME?.trim() && process.env.WEB_PASSWORD?.trim()
      ? [
          {
            name: 'Auth Enabled',
            testMatch: '**/auth-enabled.test.tsx',
            use: {
              ...devices['Desktop Chrome'],
            },
          },
        ]
      : [
          {
            name: 'Desktop Chrome',
            use: {
              ...devices['Desktop Chrome'],
            },
            testIgnore: '**/auth-enabled.test.tsx',
          },
          {
            name: 'Desktop Firefox',
            use: {
              ...devices['Desktop Firefox'],
            },
            testIgnore: '**/auth-enabled.test.tsx',
          },
          {
            name: 'Desktop Safari',
            use: {
              ...devices['Desktop Safari'],
            },
            testIgnore: '**/auth-enabled.test.tsx',
          },
          // Test against mobile viewports.
          {
            name: 'Mobile Chrome',
            use: {
              ...devices['Pixel 5'],
            },
            testIgnore: '**/auth-enabled.test.tsx',
          },
          {
            name: 'Mobile Safari',
            use: devices['iPhone 12'],
            testIgnore: '**/auth-enabled.test.tsx',
          },
        ]),
  ],
})
