'use client'

import React, { useEffect } from 'react'

export default function Loader() {
  const [color, setColor] = React.useState('black')

  useEffect(() => {
    async function getLoader() {
      const { helix } = await import('ldrs')
      helix.register()
    }
    getLoader()
    setColor(window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black')
  }, [])
  return <l-helix size={100} speed={2.5} color={color} />
}
