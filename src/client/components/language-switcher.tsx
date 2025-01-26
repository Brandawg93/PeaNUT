import { HiOutlineLanguage } from 'react-icons/hi2'
import React, { useContext } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
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

  const handleSelect = (language: string) => {
    i18n.changeLanguage(language)
  }

  const isActive = (value: string) => {
    return i18next.language === value ? 'bg-secondary' : ''
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild data-testid='language-trigger'>
        <Button size='lg' variant='ghost' title={t('sidebar.language')} className='px-3'>
          <HiOutlineLanguage className='!h-6 !w-6 text-black dark:text-white' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <ul className='grid grid-cols-2 gap-1 outline-none outline-0'>
          {languages.map((language) => (
            <DropdownMenuItem
              key={language.value}
              className={`cursor-pointer ${isActive(language.value)}`.trim()}
              onClick={() => handleSelect(language.value)}
            >
              {language.flag}&nbsp;{language.label}
            </DropdownMenuItem>
          ))}
        </ul>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
