import React, { useContext, useCallback } from 'react'
import { Button, ButtonGroup } from '@material-tailwind/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

import { ThemeContext } from '@/client/context/theme'

export default function DayNightSwitch() {
  const { preference, setPreference } = useContext(ThemeContext)

  const updateTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      setPreference(newTheme)
    },
    [preference]
  )

  const handleLight = useCallback(() => updateTheme('light'), [updateTheme])
  const handleDark = useCallback(() => updateTheme('dark'), [updateTheme])
  const handleSystem = useCallback(() => updateTheme('system'), [updateTheme])

  const isActive = (value: string) => (preference === value ? 'bg-gray-200 dark:bg-gray-800' : 'bg-transparent')

  const iconClass = (value: string) =>
    preference === value
      ? 'text-black dark:text-white'
      : 'text-gray-800 hover:text-black dark:text-gray-300 dark:hover:text-white'

  return (
    <div className='inline-block' data-testid='daynight'>
      <ButtonGroup size='sm' variant='filled' className='mt-3 gap-[1px]' title='Toggle theme'>
        <Button
          data-testid='light'
          onClick={handleLight}
          className={`flex h-8 justify-center rounded-full border-none p-[4px] shadow-none hover:shadow-none ${isActive('light')}`}
        >
          <SunIcon className={`h-6 w-6 stroke-2 ${iconClass('light')}`} />
        </Button>
        <Button
          data-testid='dark'
          onClick={handleDark}
          className={`flex h-8 justify-center rounded-full border-none p-[4px] shadow-none hover:shadow-none ${isActive('dark')}`}
        >
          <MoonIcon className={`h-6 w-6 stroke-2 ${iconClass('dark')}`} />
        </Button>
        <Button
          data-testid='system'
          onClick={handleSystem}
          className={`flex h-8 justify-center rounded-full border-none p-[4px] shadow-none hover:shadow-none ${isActive('system')}`}
        >
          <ComputerDesktopIcon className={`h-6 w-6 stroke-2 ${iconClass('system')}`} />
        </Button>
      </ButtonGroup>
    </div>
  )
}
