'use client'

/* global window */
import React, { createContext, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const ThemeContext = createContext({ theme: 'system', setTheme: (theme: 'light' | 'dark' | 'system') => {} })

export const getCurrentTheme = (): 'light' | 'dark' | 'system' => {
  if (localStorage.theme === 'dark') return 'dark'
  if (localStorage.theme === 'light') return 'light'
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) return 'light'
  return 'system'
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system')
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    if (media.matches !== matches) {
      setMatches(media.matches)
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', media.matches)
        document.documentElement.classList.toggle('light', !media.matches)
      }
    }
    const listener = () => {
      setMatches(media.matches)
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', media.matches)
        document.documentElement.classList.toggle('light', !media.matches)
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

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
