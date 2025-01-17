'use client'

import resourcesToBackend from 'i18next-resources-to-backend'

export const fallbackLng = 'en'
export const languages = [fallbackLng, 'es', 'de', 'fr', 'it', 'ro']
export const defaultNS = 'translation'
export const cookieName = 'i18next'
export const localStorageName = 'i18nextLng'

export function getOptions(lng = fallbackLng, ns = defaultNS) {
  return {
    // debug: true,
    supportedLngs: languages,
    fallbackLng,
    lng,
    fallbackNS: defaultNS,
    defaultNS,
    ns,
  }
}

export const resources = resourcesToBackend(
  (language: string, namespace: string) => import(`./locales/${language}/${namespace}.json`)
)
