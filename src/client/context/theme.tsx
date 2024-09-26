'use client'

/* global window */
import React, { createContext, useEffect, useState } from 'react'
import { ThemeProvider as MaterialProvider } from '@material-tailwind/react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ThemeContext = createContext({ theme: 'system', setTheme: (theme: 'light' | 'dark' | 'system') => {} })

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    if (media.matches !== matches) {
      setMatches(media.matches)
      if (theme === 'system') {
        if (media.matches) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.add('light')
          document.documentElement.classList.remove('dark')
        }
      }
    }
    const listener = () => {
      setMatches(media.matches)
      if (theme === 'system') {
        if (media.matches) {
          document.documentElement.classList.add('dark')
          document.documentElement.classList.remove('light')
        } else {
          document.documentElement.classList.add('light')
          document.documentElement.classList.remove('dark')
        }
      }
    }
    const darkModePreference = window.matchMedia('(prefers-color-scheme: dark)')
    darkModePreference.addEventListener('change', listener)
    return () => darkModePreference.removeEventListener('change', listener)
  }, [matches])

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
      document.documentElement.classList.remove('light')
    } else {
      document.documentElement.classList.add('light')
      document.documentElement.classList.remove('dark')
    }

    if (localStorage.theme === 'dark') setTheme('dark')
    else if (localStorage.theme === 'light') setTheme('light')
    else setTheme('system')
  }, [])

  return (
    <MaterialProvider>
      <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
    </MaterialProvider>
  )
}
