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
    preload: runsOnServerSide ? languages : [],
  })

export const LanguageContext = createContext(i18next.language)

export default function LanguageProvider({ children }: { readonly children: React.ReactNode }) {
  return <LanguageContext.Provider value={i18next.language}>{children}</LanguageContext.Provider>
}
