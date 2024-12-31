import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { ChevronUpDownIcon } from '@heroicons/react/24/outline'

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
  const { i18n } = useTranslation(lng)

  const handleSelect = (event: any) => {
    const value = event.target.value as string
    i18n.changeLanguage(value)
  }

  return (
    <div
      className='relative flex h-full w-full flex-row justify-between rounded-md border border-gray-300 text-gray-800 hover:text-black dark:border-gray-800 dark:text-gray-300 dark:hover:text-white'
      data-testid='languageswitchmobile'
    >
      <select
        data-testid='select'
        value={i18n.language}
        onChange={handleSelect}
        className='h-9 appearance-none bg-transparent pl-2 outline-none'
      >
        {languages.map((language) => (
          <option key={language.value} value={language.value}>
            {language.flag}&nbsp;{language.label}
          </option>
        ))}
      </select>
      <div className='inline-flex h-full flex-col justify-center'>
        <ChevronUpDownIcon className='h-5 w-5' />
      </div>
    </div>
  )
}
