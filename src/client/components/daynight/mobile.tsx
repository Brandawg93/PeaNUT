import React, { useContext } from 'react'
import { ChevronUpDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { ThemeContext } from '../themecontext'

export default function DayNightSwitch() {
  const { theme, setTheme } = useContext(ThemeContext)

  const handleSelect = (event: any) => {
    const eventKey = event.target.value
    if (!eventKey) return
    if (eventKey === 'light') handleLight()
    if (eventKey === 'dark') handleDark()
    if (eventKey === 'system') handleSystem()
  }

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

  const getIcon = () => {
    if (theme === 'light') return <SunIcon className='h-6 w-6 stroke-2' />
    if (theme === 'dark') return <MoonIcon className='h-6 w-6 stroke-2' />
    if (theme === 'system') return <ComputerDesktopIcon className='h-6 w-6 stroke-2' />
  }

  return (
    <div className='relative inline-block h-full rounded-md border border-gray-300 text-gray-800 hover:text-black dark:border-gray-800 dark:text-gray-300 dark:hover:text-white'>
      <div className='absolute left-0 z-0 ml-2 mr-2 inline-flex h-full flex-col justify-center'>{getIcon()}</div>
      <div className='inline'>
        <select
          onChange={handleSelect}
          className='relative z-10 h-9 appearance-none bg-transparent pl-11 pr-5 outline-none'
        >
          <option selected={theme === 'light'} value='light'>
            Light
          </option>
          <option selected={theme === 'dark'} value='dark'>
            Dark
          </option>
          <option selected={theme === 'system'} value='system'>
            System
          </option>
        </select>
      </div>
      <div className='absolute right-0 z-0 inline-flex h-full flex-col justify-center'>
        <ChevronUpDownIcon className='h-5 w-5' />
      </div>
    </div>
  )
}
