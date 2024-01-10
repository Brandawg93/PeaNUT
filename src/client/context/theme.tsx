'use client'

import React, { createContext, useEffect, useState } from 'react'
import { ThemeProvider as MaterialProvider } from '@material-tailwind/react'

export const ThemeContext = createContext({ theme: 'system', setTheme: (theme: string) => {} })

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    if (
      localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
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
