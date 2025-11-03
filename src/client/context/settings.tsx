'use client'

import { getSettings } from '@/app/actions'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useMemo,
  useRef,
  startTransition,
} from 'react'
import { SettingsType } from '@/server/settings'
import { LanguageContext } from './language'

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

// Utility hooks for specific settings
export const useDateFormat = () => {
  const { settings } = useSettings()
  return settings.DATE_FORMAT || 'MM/DD/YYYY'
}

export const useTimeFormat = () => {
  const { settings } = useSettings()
  return settings.TIME_FORMAT || '12-hour'
}

export const useDashboardSections = () => {
  const { settings } = useSettings()
  return (
    settings.DASHBOARD_SECTIONS || [
      { key: 'KPIS', enabled: true },
      { key: 'CHARTS', enabled: true },
      { key: 'VARIABLES', enabled: true },
    ]
  )
}

export const useInfluxConfig = () => {
  const { settings } = useSettings()
  return {
    host: settings.INFLUX_HOST || '',
    token: settings.INFLUX_TOKEN || '',
    org: settings.INFLUX_ORG || '',
    bucket: settings.INFLUX_BUCKET || '',
    interval: settings.INFLUX_INTERVAL || 10,
    isConfigured: !!(settings.INFLUX_HOST && settings.INFLUX_TOKEN && settings.INFLUX_ORG && settings.INFLUX_BUCKET),
  }
}

export const useNutServers = () => {
  const { settings } = useSettings()
  return settings.NUT_SERVERS || []
}

export const useVersionCheck = () => {
  const { settings } = useSettings()
  return settings.DISABLE_VERSION_CHECK || false
}

// Shared utility function for date formatting
const formatDateWithSettings = (date: Date, dateFormat: string, lng: string) => {
  const year = date.getFullYear()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')

  if (!dateFormat) {
    return date.toLocaleDateString(lng)
  }

  return dateFormat
    .replace('YYYY', year.toString())
    .replace('MM', month)
    .replace('DD', day)
    .replace('Month', date.toLocaleString(lng, { month: 'long' }))
    .replace('D', date.getDate().toString())
}

// Utility functions for formatting
export const useFormatDateTime = () => {
  const { settings } = useSettings()
  const lng = useContext(LanguageContext)

  return useCallback(
    (date: Date) => {
      const dateFormat = settings.DATE_FORMAT || 'MM/DD/YYYY'
      const timeFormat = settings.TIME_FORMAT || '12-hour'

      const formatTime = (date: Date) => {
        return date.toLocaleTimeString(lng, {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: timeFormat === '12-hour',
        })
      }

      const formattedDate = formatDateWithSettings(date, dateFormat, lng)
      const formattedTime = formatTime(date)

      return `${formattedDate} ${formattedTime}`
    },
    [settings.DATE_FORMAT, settings.TIME_FORMAT, lng]
  )
}

export const useFormatDate = () => {
  const { settings } = useSettings()
  const lng = useContext(LanguageContext)

  return useCallback(
    (date: Date) => {
      const dateFormat = settings.DATE_FORMAT || 'MM/DD/YYYY'
      return formatDateWithSettings(date, dateFormat, lng)
    },
    [settings.DATE_FORMAT, lng]
  )
}

export const SettingsProvider = ({ children }: { readonly children: React.ReactNode }) => {
  const [settings, setSettings] = useState<Partial<SettingsType>>({})
  const isInitializedRef = useRef(false)

  const fetchSettings = useCallback(async () => {
    try {
      // Load all commonly used settings
      const [
        dateFormat,
        timeFormat,
        sections,
        disableVersionCheck,
        influxHost,
        influxToken,
        influxOrg,
        influxBucket,
        influxInterval,
        nutServers,
      ] = await Promise.all([
        getSettings('DATE_FORMAT'),
        getSettings('TIME_FORMAT'),
        getSettings('DASHBOARD_SECTIONS'),
        getSettings('DISABLE_VERSION_CHECK'),
        getSettings('INFLUX_HOST'),
        getSettings('INFLUX_TOKEN'),
        getSettings('INFLUX_ORG'),
        getSettings('INFLUX_BUCKET'),
        getSettings('INFLUX_INTERVAL'),
        getSettings('NUT_SERVERS'),
      ])

      setSettings({
        DATE_FORMAT: dateFormat || '',
        TIME_FORMAT: timeFormat || '',
        DASHBOARD_SECTIONS: sections,
        DISABLE_VERSION_CHECK: disableVersionCheck || false,
        INFLUX_HOST: influxHost || '',
        INFLUX_TOKEN: influxToken || '',
        INFLUX_ORG: influxOrg || '',
        INFLUX_BUCKET: influxBucket || '',
        INFLUX_INTERVAL: influxInterval || 10,
        NUT_SERVERS: nutServers || [],
      })
    } catch {
      // Handle error silently in tests
      setSettings({
        DATE_FORMAT: '',
        TIME_FORMAT: '',
        DISABLE_VERSION_CHECK: false,
        INFLUX_HOST: '',
        INFLUX_TOKEN: '',
        INFLUX_ORG: '',
        INFLUX_BUCKET: '',
        INFLUX_INTERVAL: 10,
        NUT_SERVERS: [],
      })
    }
  }, [])

  useEffect(() => {
    // Only fetch settings once on mount using ref to avoid setState in effect
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      // Use startTransition to defer the state update and avoid synchronous setState warning
      startTransition(() => {
        fetchSettings()
      })
    }
  }, [fetchSettings])

  const value = useMemo(() => ({ settings, refreshSettings: fetchSettings }), [settings, fetchSettings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}
