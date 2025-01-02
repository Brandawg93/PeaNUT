import { HiOutlineLanguage } from 'react-icons/hi2'
import React, { useContext } from 'react'
import { Menu, MenuHandler, MenuList, MenuItem, IconButton } from '@material-tailwind/react'
import { useTranslation } from 'react-i18next'
import i18next from 'i18next'
import { LanguageContext } from '@/client/context/language'

const languages = [
  { value: 'en', label: 'English', flag: '🇺🇸' },
  { value: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { value: 'es', label: 'Español', flag: '🇪🇸' },
  { value: 'fr', label: 'Français', flag: '🇫🇷' },
  { value: 'it', label: 'Italiano', flag: '🇮🇹' },
  { value: 'ro', label: 'Română', flag: '🇷🇴' },
]

export default function LanguageSwitcher() {
  const lng = useContext<string>(LanguageContext)
  const { t, i18n } = useTranslation(lng)

  const handleSelect = (event: any) => {
    const value = event.target.value as string
    i18n.changeLanguage(value)
  }

  const isActive = (value: string) => {
    return i18next.language === value ? 'bg-blue-700 text-white' : ''
  }

  return (
    <Menu>
      <MenuHandler>
        <IconButton
          variant='text'
          title={t('sidebar.language')}
          className='px-3 text-black shadow-none hover:bg-gray-400 dark:text-white dark:hover:bg-gray-800'
        >
          <HiOutlineLanguage className='h-6 w-6 stroke-2 dark:text-white' />
        </IconButton>
      </MenuHandler>
      <MenuList className='min-w-0 border-gray-300 text-black dark:border-gray-800 dark:bg-gray-900 dark:text-white'>
        <ul className='grid grid-cols-2 gap-1 outline-none outline-0'>
          {languages.map((language) => (
            <MenuItem
              key={language.value}
              className={`${isActive(language.value)}`}
              value={language.value}
              onClick={handleSelect}
            >
              {language.flag}&nbsp;{language.label}
            </MenuItem>
          ))}
        </ul>
      </MenuList>
    </Menu>
  )
}
