'use client'

/* global window */
import React, { createContext, useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

type ThemeContextType = {
  preference: 'light' | 'dark' | 'system'
  theme: 'light' | 'dark'
  setPreference: (theme: 'light' | 'dark' | 'system') => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const ThemeContext = createContext<ThemeContextType>({
  preference: 'system',
  theme: 'dark',
  setPreference: () => {},
  setTheme: () => {},
})

const getCurrentTheme = (): 'light' | 'dark' => {
  const storedTheme = localStorage.getItem('theme')
  if (storedTheme === 'dark' || storedTheme === 'light') return storedTheme as 'light' | 'dark'
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
  return 'light'
}

const setCurrentTheme = (newTheme: 'light' | 'dark' | 'system') => {
  if (newTheme === 'system') {
    localStorage.removeItem('theme')
  } else {
    localStorage.setItem('theme', newTheme)
  }
  document.documentElement.classList.remove('light', 'dark')
  if (newTheme === 'system') {
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    document.documentElement.classList.add(systemTheme)
  } else {
    document.documentElement.classList.add(newTheme)
  }
}

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [preference, setPreference] = useState<'light' | 'dark' | 'system'>('system')
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme())
  const pathname = usePathname()

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = () => {
      if (preference === 'system') {
        const systemTheme = media.matches ? 'dark' : 'light'
        document.documentElement.classList.toggle('dark', media.matches)
        document.documentElement.classList.toggle('light', !media.matches)
        setTheme(systemTheme)
      } else {
        document.documentElement.classList.toggle('dark', preference === 'dark')
        document.documentElement.classList.toggle('light', preference === 'light')
        setTheme(preference)
      }
    }

    media.addEventListener('change', listener)
    listener()
    return () => media.removeEventListener('change', listener)
  }, [preference])

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme')
    if (storedTheme === 'dark' || storedTheme === 'light') {
      setPreference(storedTheme)
      setTheme(storedTheme)
    } else {
      setPreference('system')
    }
  }, [])

  useEffect(() => {
    document.body.style.backgroundColor = pathname !== '/api/docs' && theme === 'dark' ? '#000' : '#fff'
  }, [theme, pathname])

  useEffect(() => {
    setCurrentTheme(preference)
    if (preference === 'system') {
      setTheme(getCurrentTheme())
    } else {
      setTheme(preference)
    }
  }, [preference])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, preference, setPreference }}>{children}</ThemeContext.Provider>
  )
}
