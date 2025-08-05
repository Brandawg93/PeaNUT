'use client'

import { useState, useEffect, useCallback } from 'react'

interface NotificationSettings {
  enabled: boolean
  criticalOnly: boolean
  soundEnabled: boolean
}

export function useUPSNotifications() {
  const [isRegistered, setIsRegistered] = useState(false)
  const [isPolling, setIsPolling] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [settings, setSettings] = useState<NotificationSettings>({
    enabled: false,
    criticalOnly: true,
    soundEnabled: true,
  })

  // Check if service worker is supported
  const isSupported = typeof window !== 'undefined' && 'serviceWorker' in navigator

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if (!isSupported) {
      console.warn('Service Workers are not supported')
      return false
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js')
      console.log('Service Worker registered:', registration)

      // Wait for the service worker to be ready
      await navigator.serviceWorker.ready
      setIsRegistered(true)
      return true
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return false
    }
  }, [isSupported])

  // Request notification permission
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('Notifications are not supported')
      return false
    }

    if (Notification.permission === 'granted') {
      setPermission('granted')
      return true
    }

    if (Notification.permission === 'denied') {
      setPermission('denied')
      return false
    }

    const result = await Notification.requestPermission()
    setPermission(result)
    return result === 'granted'
  }, [])

  // Start UPS polling
  const startPolling = useCallback(async () => {
    if (!isRegistered) {
      const registered = await registerServiceWorker()
      if (!registered) return false
    }

    const granted = await requestPermission()
    if (!granted) {
      console.warn('Notification permission not granted')
      return false
    }

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'START_UPS_POLLING',
      })
      setIsPolling(true)
      return true
    } else {
      console.warn('Service Worker controller not available')
      return false
    }
  }, [isRegistered, registerServiceWorker, requestPermission])

  // Stop UPS polling
  const stopPolling = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'STOP_UPS_POLLING',
      })
      setIsPolling(false)
    }
  }, [])

  // Get polling status
  const getPollingStatus = useCallback(() => {
    if (navigator.serviceWorker.controller) {
      const channel = new MessageChannel()
      channel.port1.onmessage = (event) => {
        setIsPolling(event.data.isActive)
      }
      navigator.serviceWorker.controller.postMessage(
        {
          type: 'GET_POLLING_STATUS',
        },
        [channel.port2]
      )
    }
  }, [])

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<NotificationSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))

      // Save to localStorage
      if (typeof window !== 'undefined') {
        const updated = { ...settings, ...newSettings }
        localStorage.setItem('ups-notification-settings', JSON.stringify(updated))
      }
    },
    [settings]
  )

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('ups-notification-settings')
        if (stored) {
          setSettings(JSON.parse(stored))
        }
      } catch (error) {
        console.warn('Failed to load notification settings:', error)
      }
    }
  }, [])

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
  }, [])

  // Register service worker on mount
  useEffect(() => {
    if (isSupported) {
      registerServiceWorker()
    }
  }, [isSupported, registerServiceWorker])

  // Check polling status periodically
  useEffect(() => {
    if (isRegistered) {
      getPollingStatus()
      const interval = setInterval(getPollingStatus, 5000)
      return () => clearInterval(interval)
    }
  }, [isRegistered, getPollingStatus])

  return {
    isSupported,
    isRegistered,
    isPolling,
    permission,
    settings,
    startPolling,
    stopPolling,
    updateSettings,
    requestPermission,
  }
}
