'use client'

import React, { useEffect } from 'react'
import { useTheme } from 'next-themes'

export default function Loader() {
  const [color, setColor] = React.useState('black')
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    async function getLoader() {
      const { helix } = await import('ldrs')
      helix.register()
    }
    getLoader()
  }, [])

  useEffect(() => {
    setColor(resolvedTheme === 'dark' ? 'white' : 'black')
  }, [resolvedTheme])

  return <l-helix size={100} speed={2.5} color={color} />
}
