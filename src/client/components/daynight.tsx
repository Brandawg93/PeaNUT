import React, { useState } from 'react'
import { Button, ButtonGroup } from '@material-tailwind/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'

export default function DayNightSwitch() {
  const [theme, setTheme] = useState(localStorage.theme || 'system')

  const handleLight = () => {
    localStorage.theme = 'light'
    setTheme('light')
    document.documentElement.classList.remove('dark')
    document.documentElement.classList.add('light')
  }

  const handleDark = () => {
    localStorage.theme = 'dark'
    setTheme('dark')
    document.documentElement.classList.remove('light')
    document.documentElement.classList.add('dark')
  }

  const handleSystem = () => {
    localStorage.removeItem('theme')
    setTheme('system')
    document.documentElement.classList.remove('light')
    document.documentElement.classList.remove('dark')
    if (window.matchMedia('(prefers-color-scheme: light)').matches) document.documentElement.classList.add('light')
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) document.documentElement.classList.add('dark')
  }

  const isActive = (value: string) => {
    return theme === value ? 'bg-gray-200 dark:bg-gray-800' : 'bg-transparent'
  }

  return (
    <div className='inline-block'>
      <ButtonGroup size='sm' variant='filled' className='mt-3 gap-[1px]'>
        <Button
          onClick={handleLight}
          className={`flex h-8 justify-center border-none p-[4px] shadow-none hover:shadow-none rounded-full ${isActive('light')}`}
        >
          <SunIcon className={`h-6 w-6 stroke-2 ${theme === 'light' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300 dark:hover:text-white hover:text-black'}`} />
        </Button>
        <Button
          onClick={handleDark}
          className={`flex h-8 justify-center border-none p-[4px] shadow-none hover:shadow-none rounded-full ${isActive('dark')}`}
        >
          <MoonIcon className={`h-6 w-6 stroke-2 ${theme === 'dark' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300 dark:hover:text-white hover:text-black'}`} />
        </Button>
        <Button
          onClick={handleSystem}
          className={`flex h-8 justify-center border-none p-[4px] shadow-none hover:shadow-none rounded-full ${isActive('system')}`}
        >
          <ComputerDesktopIcon className={`h-6 w-6 stroke-2 ${theme === 'system' ? 'text-black dark:text-white' : 'text-gray-800 dark:text-gray-300 dark:hover:text-white hover:text-black'}`} />
        </Button>
      </ButtonGroup>
    </div>
  )
}
