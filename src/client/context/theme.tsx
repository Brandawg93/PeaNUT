'use client'

/* global window */
import React, { createContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type themeContextType = {
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const ThemeContext = createContext<themeContextType>({
  theme: 'system',
  setTheme: () => {},
})

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
  const pathname = usePathname()

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

  useEffect(() => {
    document.body.style.backgroundColor = pathname !== '/api/docs' && getCurrentTheme() === 'dark' ? '#000' : '#fff'
  }, [theme, matches])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
