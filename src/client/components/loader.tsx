'use client'

import React, { useEffect, useContext } from 'react'
import { ThemeContext } from '@/client/context/theme'

export default function Loader() {
  const [color, setColor] = React.useState('black')
  const { theme } = useContext(ThemeContext)

  useEffect(() => {
    async function getLoader() {
      const { helix } = await import('ldrs')
      helix.register()
    }
    getLoader()
    setColor(theme === 'dark' ? 'white' : 'black')
  }, [])
  return <l-helix size={100} speed={2.5} color={color} />
}
