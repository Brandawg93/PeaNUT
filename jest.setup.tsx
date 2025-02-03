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
  watch: jest.fn(),
}))

jest.mock('lucide-react', () => ({
  ChevronDown: jest.fn(),
  ChevronUp: jest.fn(),
  ChevronRight: jest.fn(),
  Check: jest.fn(),
  Circle: jest.fn(),
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
