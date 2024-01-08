import React, { createContext } from 'react'

export const ThemeContext = createContext({ theme: 'system', setTheme: (theme: string) => {} })
