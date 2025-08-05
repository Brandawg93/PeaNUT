// Service Worker for UPS Status Notifications
const POLL_INTERVAL = 30000 // 30 seconds
const NOTIFICATION_TAG = 'ups-status-change'

// Critical statuses that should trigger notifications
const CRITICAL_STATUSES = [
  'OB', // On Battery
  'LB', // Low Battery
  'HB', // High Battery
  'RB', // Battery Needs Replacement
  'FSD', // Forced Shutdown
  'ALARM', // Alarm
  'OVER', // Overloaded
  'DEVICE_UNREACHABLE',
]

// UPS status mapping
const UPS_STATUS_MAP = {
  OL: 'Online',
  'OL CHRG': 'Online Charging',
  OB: 'On Battery',
  LB: 'Low Battery',
  HB: 'High Battery',
  RB: 'Battery Needs Replacement',
  CHRG: 'Battery Charging',
  DISCHRG: 'Battery Discharging',
  BYPASS: 'Bypass Active',
  CAL: 'Runtime Calibration',
  OFF: 'Offline',
  OVER: 'Overloaded',
  TRIM: 'Trimming Voltage',
  BOOST: 'Boosting Voltage',
  FSD: 'Forced Shutdown',
  ALARM: 'Alarm',
  DEVICE_UNREACHABLE: 'Device Unreachable',
}

class UPSNotificationManager {
  constructor() {
    this.previousStatuses = new Map()
    this.isPolling = false
    this.pollInterval = null
    this.loadPreviousStatuses()
  }

  loadPreviousStatuses() {
    // Load previous statuses from IndexedDB
    if ('indexedDB' in self) {
      // For now, we'll use a simple approach with localStorage fallback
      // In a production app, you'd want to use IndexedDB for better storage
    }
  }

  savePreviousStatuses() {
    // Save previous statuses - in a real implementation, use IndexedDB
  }

  getStatusText(status) {
    return UPS_STATUS_MAP[status] || status
  }

  isCriticalStatus(status) {
    return CRITICAL_STATUSES.some((critical) => status.includes(critical))
  }

  async checkStatusChange(device) {
    const previousStatus = this.previousStatuses.get(device.name)

    if (!previousStatus || previousStatus === device.status) {
      this.previousStatuses.set(device.name, device.status)
      return null
    }

    const change = {
      deviceName: device.name,
      previousStatus,
      currentStatus: device.status,
      timestamp: new Date(),
    }

    this.previousStatuses.set(device.name, device.status)
    return change
  }

  async showNotification(change) {
    const previousText = this.getStatusText(change.previousStatus)
    const currentText = this.getStatusText(change.currentStatus)
    const isCritical = this.isCriticalStatus(change.currentStatus)

    const notificationOptions = {
      body: `${change.deviceName}: ${previousText} → ${currentText}`,
      icon: '/icon.svg',
      badge: '/icon.svg',
      tag: `${NOTIFICATION_TAG}-${change.deviceName}`,
      requireInteraction: isCritical,
      silent: false,
      data: {
        deviceName: change.deviceName,
        previousStatus: change.previousStatus,
        currentStatus: change.currentStatus,
        timestamp: change.timestamp.toISOString(),
      },
    }

    // Auto-close non-critical notifications after 10 seconds
    if (!isCritical) {
      setTimeout(() => {
        self.registration.getNotifications().then((notifications) => {
          notifications.forEach((notification) => {
            if (notification.tag === notificationOptions.tag) {
              notification.close()
            }
          })
        })
      }, 10000)
    }

    return new Notification('UPS Status Change', notificationOptions)
  }

  async fetchUPSDevices() {
    try {
      console.log('Fetching UPS devices...')
      // Get the current page URL to determine the API endpoint
      const clients = await self.clients.matchAll()
      const mainClient = clients.find((client) => client.url.includes('/'))

      if (!mainClient) {
        console.warn('No main client found')
        return []
      }

      const baseUrl = new URL(mainClient.url).origin
      console.log('Base URL:', baseUrl)

      const response = await fetch(`${baseUrl}/api/v1/devices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('UPS devices data:', data)

      const devices =
        data.devices?.map((device) => ({
          name: device.name,
          status: device.vars?.['ups.status']?.value || 'UNKNOWN',
          description: device.description,
        })) || []

      console.log('Processed devices:', devices)
      return devices
    } catch (error) {
      console.error('Failed to fetch UPS devices:', error)
      return []
    }
  }

  async startPolling() {
    if (this.isPolling) {
      console.log('UPS polling already active')
      return
    }

    this.isPolling = true
    console.log('Starting UPS status polling...')

    const poll = async () => {
      try {
        const devices = await this.fetchUPSDevices()

        for (const device of devices) {
          const change = await this.checkStatusChange(device)
          if (change) {
            console.log('UPS status change detected:', change)
            await this.showNotification(change)
          }
        }
      } catch (error) {
        console.error('Error during UPS polling:', error)
      }
    }

    // Initial poll
    await poll()

    // Set up interval
    this.pollInterval = setInterval(poll, POLL_INTERVAL)
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
      this.pollInterval = null
    }
    this.isPolling = false
    console.log('UPS polling stopped')
  }

  isActive() {
    return this.isPolling
  }
}

// Global notification manager instance
const notificationManager = new UPSNotificationManager()

// Service Worker Event Handlers
self.addEventListener('install', () => {
  console.log('UPS Notification Service Worker installing...')
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  console.log('UPS Notification Service Worker activating...')
  event.waitUntil(self.clients.claim())
})

self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data)

  if (event.data && event.data.type === 'START_UPS_POLLING') {
    console.log('Received start polling message')
    notificationManager.startPolling()
  } else if (event.data && event.data.type === 'STOP_UPS_POLLING') {
    console.log('Received stop polling message')
    notificationManager.stopPolling()
  } else if (event.data && event.data.type === 'GET_POLLING_STATUS') {
    const isActive = notificationManager.isActive()
    console.log('Polling status requested, isActive:', isActive)
    event.ports[0]?.postMessage({ isActive })
  }
})

self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification)

  event.notification.close()

  // Focus the main window
  event.waitUntil(
    self.clients.matchAll().then((clients) => {
      const mainClient = clients.find((client) => client.url.includes('/'))
      if (mainClient) {
        return mainClient.focus()
      }
      return self.clients.openWindow('/')
    })
  )
})

self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification)
})

// Handle push notifications (if implemented in the future)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  if (event.data) {
    const data = event.data.json()
    console.log('Push data:', data)
  }
})
