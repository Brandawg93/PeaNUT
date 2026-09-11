import React from 'react'
import '@testing-library/jest-dom'

// jsdom's selector engine (nwsapi) is catastrophically slow — effectively hanging, not just
// slow — matching the `:popover-open` and `:modal` pseudo-classes (confirmed: 2000 raw
// `element.matches()` calls didn't finish in 60+ seconds). @floating-ui/dom >= 1.6.0 added a
// `topLayer()` check that calls both on every position computation, which is what made Radix
// dropdown/select/popover tests take 3-6s+ locally and time out entirely in CI: bisecting
// @floating-ui/dom versions showed 1.5.4 at ~20ms vs 1.8.0 at ~4.5s for the same computePosition
// call, and patching just these two selectors to short-circuit restores the ~20ms baseline.
// Neither pseudo-class is relevant here (we don't render native <dialog>/Popover-API elements),
// so always resolving them to `false` changes no test's real behavior.
const originalMatches = Element.prototype.matches
Element.prototype.matches = function (this: Element, selector: string): boolean {
  if (selector === ':popover-open' || selector === ':modal') return false
  return originalMatches.call(this, selector)
} as typeof Element.prototype.matches

jest.mock('react-i18next', () => ({
  // this mock makes sure any components using the translate hook can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str: string) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    }
  },
  initReactI18next: {
    type: '3rdParty',
    init: () => {},
  },
}))

jest.mock('fs', () => ({
  readFileSync: jest.fn(),
  writeFileSync: jest.fn(),
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  unlinkSync: jest.fn(),
  watch: jest.fn(),
  accessSync: jest.fn(),
  statSync: jest.fn(),
  constants: { W_OK: 2 },
}))

jest.mock('lucide-react', () => ({
  ChevronDown: jest.fn(),
  ChevronUp: jest.fn(),
  ChevronRight: jest.fn(),
  Check: jest.fn(),
  Circle: jest.fn(),
  ChevronDownIcon: jest.fn(() => <div data-testid='chevron-down-icon' />),
  CheckIcon: jest.fn(() => <div data-testid='check-icon' />),
  ChevronUpIcon: jest.fn(() => <div data-testid='chevron-up-icon' />),
}))

jest.mock('recharts', () => {
  const OriginalRechartsModule = jest.requireActual('recharts')
  return {
    ...OriginalRechartsModule,
    ResponsiveContainer: ({ children }: { children: any }) => (
      <div style={{ width: '100%', height: '100%' }}>{children}</div>
    ),
  }
})

// Mock next-runtime-env
jest.mock('next-runtime-env', () => ({
  env: jest.fn(() => ''),
  PublicEnvScript: jest.fn(() => null),
  EnvScript: jest.fn(() => null),
  PublicEnvProvider: jest.fn(({ children }) => children),
  useEnvContext: jest.fn(() => ({})),
}))

globalThis.PointerEvent = MouseEvent as typeof PointerEvent

// Mock window.matchMedia for next-themes
Object.defineProperty(globalThis, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

jest.mock('next-auth/react', () => {
  const originalModule = jest.requireActual('next-auth/react')
  const mockSession = {
    expires: new Date(Date.now() + 2 * 86400).toISOString(),
    user: { username: 'admin', id: 1 },
  }
  return {
    __esModule: true,
    ...originalModule,
    useSession: jest.fn(
      () => ({ data: mockSession, status: 'authenticated' }) // return type is [] in v3 but changed to {} in v4
    ),
  }
})

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      replace: jest.fn(),
    }
  },
  useSearchParams: jest.fn(() => {
    return {
      get: jest.fn(),
    }
  }),
}))

// Mock Next.js server modules for Jest
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((body, init) => ({
      body,
      status: init?.status || 200,
      headers: new Map(),
    })),
    redirect: jest.fn((url) => ({
      status: 302,
      headers: new Map([['location', url]]),
    })),
  },
}))
// Global mock for fetch to avoid warnings in components that fetch on mount
globalThis.fetch = jest.fn().mockImplementation(() =>
  Promise.resolve({
    json: () => Promise.resolve([]),
    ok: true,
  })
)
