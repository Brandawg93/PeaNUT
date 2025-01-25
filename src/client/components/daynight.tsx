import React, { useContext } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { HiOutlineSun, HiOutlineMoon, HiOutlineComputerDesktop } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'

const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system']

export default function DayNightSwitch() {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { resolvedTheme, theme, setTheme } = useTheme()

  const handleSelect = (curr: 'light' | 'dark' | 'system') => {
    setTheme(curr)
  }

  const isActive = (value: 'light' | 'dark' | 'system') => {
    return theme === value ? 'bg-blue-700 focus:bg-blue-700 text-white' : 'focus:bg-gray-300 focus:dark:bg-gray-700'
  }

  const getThemeIcon = (theme?: string) => {
    const iconProps = 'h-6 w-6 stroke-2 dark:text-white'
    switch (theme) {
      case 'light':
        return <HiOutlineSun className={iconProps} />
      case 'dark':
        return <HiOutlineMoon className={iconProps} />
      case 'system':
        return <HiOutlineComputerDesktop className={iconProps} />
      default:
        return null
    }
  }

  return (
    <div data-testid='daynight'>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            title={t('theme.title')}
            className='px-2 text-black shadow-none hover:bg-gray-400 dark:text-white dark:hover:bg-gray-800'
          >
            {getThemeIcon(resolvedTheme)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className='border-gray-200 bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-white'>
          {themes.map((curr) => (
            <DropdownMenuItem
              key={curr}
              className={`cursor-pointer rounded ${isActive(curr)}`.trim()}
              onClick={() => handleSelect(curr)}
            >
              <div className='flex'>
                <div className='pr-2'>{getThemeIcon(curr)}</div>
                <span className='self-center'>{t(`theme.${curr}`)}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
