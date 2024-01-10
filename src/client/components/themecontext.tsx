'use client'

import React, { createContext, useEffect, useState } from 'react'

export const ThemeContext = createContext({ theme: 'system', setTheme: (theme: string) => {} })

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState('system')

  useEffect(() => {
    if (localStorage.theme === 'dark') setTheme('dark')
    else if (localStorage.theme === 'light') setTheme('light')
    else setTheme('system')
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}
