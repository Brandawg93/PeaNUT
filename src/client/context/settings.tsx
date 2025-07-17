'use client'

import { getSettings } from '@/app/actions'
import React, { createContext, useCallback, useContext, useEffect, useState, useMemo } from 'react'
import { SettingsType } from '@/server/settings'

type SettingsContextType = {
  settings: Partial<SettingsType>
  refreshSettings: () => void
}

export const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  refreshSettings: () => {},
})

export const useSettings = () => {
  return useContext(SettingsContext)
}

export const SettingsProvider = ({ children }: { readonly children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Partial<SettingsType>>({})

  const fetchSettings = useCallback(async () => {
    try {
      const dateFormat = await getSettings('DATE_FORMAT')
      const timeFormat = await getSettings('TIME_FORMAT')
      setSettings({ DATE_FORMAT: dateFormat || '', TIME_FORMAT: timeFormat || '' })
    } catch {
      // Handle error silently in tests
      setSettings({ DATE_FORMAT: '', TIME_FORMAT: '' })
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const value = useMemo(() => ({ settings, refreshSettings: fetchSettings }), [settings, fetchSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
