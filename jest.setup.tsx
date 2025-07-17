import React from 'react'
import '@testing-library/jest-dom'

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

window.PointerEvent = MouseEvent as typeof PointerEvent

// Mock window.matchMedia for next-themes
Object.defineProperty(window, 'matchMedia', {
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
