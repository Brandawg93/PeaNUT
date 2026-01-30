'use client'

import React, { createContext } from 'react'
import { getOptions, languages, resources } from '@/client/i18n'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const runsOnServerSide = globalThis.window === undefined

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resources)
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    preload: runsOnServerSide ? languages : [],
  })

export const LanguageContext = createContext(i18next.language)

export default function LanguageProvider({ children }: { readonly children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = React.useState(i18next.language)

  React.useEffect(() => {
    const handleLanguageChange = () => {
      setCurrentLanguage(i18next.language)
    }

    i18next.on('languageChanged', handleLanguageChange)

    return () => {
      i18next.off('languageChanged', handleLanguageChange)
    }
  }, [])

  return <LanguageContext.Provider value={currentLanguage}>{children}</LanguageContext.Provider>
}
