import React, { useContext, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { ChevronUpDownIcon, ComputerDesktopIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { ThemeContext } from '@/client/context/theme'

export default function DayNightSwitch() {
  const { preference, setPreference } = useContext(ThemeContext)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const updateTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      setPreference(newTheme)
    },
    [preference]
  )

  const handleSelect = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const eventKey = event.target.value
    if (!eventKey) return
    if (eventKey === 'light') handleLight()
    if (eventKey === 'dark') handleDark()
    if (eventKey === 'system') handleSystem()
  }, [])

  const handleLight = useCallback(() => updateTheme('light'), [updateTheme])
  const handleDark = useCallback(() => updateTheme('dark'), [updateTheme])
  const handleSystem = useCallback(() => updateTheme('system'), [updateTheme])

  const iconMap = {
    light: <SunIcon className='h-6 w-6 stroke-2' />,
    dark: <MoonIcon className='h-6 w-6 stroke-2' />,
    system: <ComputerDesktopIcon className='h-6 w-6 stroke-2' />,
  }

  return (
    <div
      className='relative flex h-full w-full flex-row justify-between rounded-md border border-gray-300 text-gray-800 hover:text-black dark:border-gray-800 dark:text-gray-300 dark:hover:text-white'
      data-testid='daynightmobile'
    >
      <div className='ml-2 mr-2 inline-flex h-full flex-col justify-center'>{iconMap[preference]}</div>
      <select
        data-testid='select'
        value={preference}
        onChange={handleSelect}
        className='h-9 appearance-none bg-transparent outline-none'
      >
        <option value='light'>{t('theme.light')}</option>
        <option value='dark'>{t('theme.dark')}</option>
        <option value='system'>{t('theme.system')}</option>
      </select>
      <div className='inline-flex h-full flex-col justify-center'>
        <ChevronUpDownIcon className='h-5 w-5' />
      </div>
    </div>
  )
}
