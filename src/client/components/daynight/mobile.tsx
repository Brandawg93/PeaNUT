import React, { useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { ChevronUpDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { ThemeContext } from '@/client/context/theme'

export default function DayNightSwitch() {
  const { theme, setTheme } = useContext<{
    theme: 'light' | 'dark' | 'system'
    setTheme: (theme: 'light' | 'dark' | 'system') => void
  }>(ThemeContext)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const updateThemeClass = (newTheme: 'light' | 'dark' | 'system') => {
    document.documentElement.classList.remove('light', 'dark')
    if (newTheme !== 'system') {
      document.documentElement.classList.add(newTheme)
    } else {
      if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        document.documentElement.classList.add('light')
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.documentElement.classList.add('dark')
      }
    }
  }

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventKey = event.target.value
    if (!eventKey) return
    if (eventKey === 'light') handleLight()
    if (eventKey === 'dark') handleDark()
    if (eventKey === 'system') handleSystem()
  }, [])

  const handleLight = useCallback(() => {
    localStorage.theme = 'light'
    setTheme('light')
    updateThemeClass('light')
  }, [setTheme])

  const handleDark = useCallback(() => {
    localStorage.theme = 'dark'
    setTheme('dark')
    updateThemeClass('dark')
  }, [setTheme])

  const handleSystem = useCallback(() => {
    localStorage.removeItem('theme')
    setTheme('system')
    updateThemeClass('system')
  }, [setTheme])

  const iconMap = {
    light: <SunIcon className='h-6 w-6 stroke-2' />,
    dark: <MoonIcon className='h-6 w-6 stroke-2' />,
    system: <ComputerDesktopIcon className='h-6 w-6 stroke-2' />,
  }

  return (
    <div
      className='relative inline-block h-full w-full rounded-md border border-gray-300 text-gray-800 hover:text-black dark:border-gray-800 dark:text-gray-300 dark:hover:text-white'
      data-testid='daynightmobile'
    >
      <div className='absolute left-0 z-0 ml-2 mr-2 inline-flex h-full flex-col justify-center'>{iconMap[theme]}</div>
      <div className='inline'>
        <select
          data-testid='select'
          value={theme}
          onChange={handleSelect}
          className='relative z-10 h-9 appearance-none bg-transparent pl-11 pr-5 outline-none'
        >
          <option value='light'>{t('theme.light')}</option>
          <option value='dark'>{t('theme.dark')}</option>
          <option value='system'>{t('theme.system')}</option>
        </select>
      </div>
      <div className='absolute right-0 z-0 inline-flex h-full flex-col justify-center'>
        <ChevronUpDownIcon className='h-5 w-5' />
      </div>
    </div>
  )
}
