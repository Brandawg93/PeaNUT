'use client'

import React, { createContext } from 'react'
import { getOptions, languages, resources } from '@/client/i18n'
import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const runsOnServerSide = typeof window === 'undefined'

i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resources)
  .init({
    ...getOptions(),
    lng: undefined, // let detect the language on client side
    detection: {
      order: ['path', 'htmlTag', 'cookie', 'navigator'],
    },
    preload: runsOnServerSide ? languages : [],
  })

const LanguageContext = createContext('en')

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <LanguageContext.Provider value={'en'}>{children}</LanguageContext.Provider>
}
