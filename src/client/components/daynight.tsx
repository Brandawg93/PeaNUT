import React, { useContext, useCallback } from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, IconButton } from '@material-tailwind/react'
import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '@/client/context/theme'

const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

export default function DayNightSwitch() {
  const lng = useContext<string>(LanguageContext)
  const { theme, preference, setPreference } = useContext(ThemeContext)
  const { t } = useTranslation(lng)

  const updateTheme = useCallback(
    (newTheme: 'light' | 'dark' | 'system') => {
      setPreference(newTheme)
    },
    [setPreference]
  )

  const handleSelect = (curr: 'light' | 'dark' | 'system') => {
    updateTheme(curr)
  }

  const isActive = (value: 'light' | 'dark' | 'system') => {
    return preference === value ? 'bg-blue-700 text-white' : ''
  }

  const getThemeIcon = (theme: 'light' | 'dark' | 'system') => {
    const iconProps = 'h-6 w-6 stroke-2 dark:text-white'
    switch (theme) {
      case 'light':
        return <SunIcon className={iconProps} />
      case 'dark':
        return <MoonIcon className={iconProps} />
      case 'system':
        return <ComputerDesktopIcon className={iconProps} />
      default:
        return null
    }
  }

  return (
    <div data-testid='daynight'>
      <Menu>
        <MenuHandler>
          <IconButton
            variant='text'
            title={t('theme.title')}
            className='px-3 text-black shadow-none hover:bg-gray-400 dark:text-white dark:hover:bg-gray-800'
          >
            {getThemeIcon(theme)}
          </IconButton>
        </MenuHandler>
        <MenuList className='min-w-0 border-gray-300 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'>
          {themes.map((curr) => (
            <MenuItem key={curr} className={isActive(curr)} onClick={() => handleSelect(curr)}>
              <div className='flex'>
                <div className='pr-2'>{getThemeIcon(curr)}</div>
                <span className='self-center'>{t(`theme.${curr}`)}</span>
              </div>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
    </div>
  )
}
