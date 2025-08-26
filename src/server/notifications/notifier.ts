import { DEVICE, Notification, NotificationProviders, NotificationTrigger } from '@/common/types'
import { YamlSettings } from '@/server/settings'
import { DEFAULT_NOTIFICATION_RATE_LIMIT } from '@/common/constants'

const settingsFile = './config/settings.yml'

export abstract class Notifier {
  name: (typeof NotificationProviders)[number]
  triggers: Array<NotificationTrigger>
  config?: { [x: string]: any }
  private lastNotificationTime: { [key: string]: number } = {}
  private readonly RATE_LIMIT_MS: number

  constructor(name: (typeof NotificationProviders)[number], triggers: Array<NotificationTrigger>) {
    this.name = name
    this.triggers = triggers
    this.validateConfig()

    // Get rate limit from settings
    const settings = new YamlSettings(settingsFile)
    this.RATE_LIMIT_MS = settings.get('NOTIFICATION_RATE_LIMIT') || DEFAULT_NOTIFICATION_RATE_LIMIT
  }

  abstract sendInternal(notification: Notification): Promise<void>

  async send(notification: Notification): Promise<void> {
    try {
      await this.sendInternal(notification)
      this.logNotification(notification, true)
    } catch (error) {
      this.logNotification(notification, false)
      throw error
    }
  }

  private shouldSendNotification(triggerKey: string): boolean {
    const now = Date.now()
    const lastTime = this.lastNotificationTime[triggerKey] || 0

    if (now - lastTime < this.RATE_LIMIT_MS) {
      return false
    }

    this.lastNotificationTime[triggerKey] = now
    return true
  }

  private validateConfig(): void {
    // Basic validation - can be overridden by specific providers
    if (!this.triggers || this.triggers.length === 0) {
      throw new Error('At least one trigger must be configured')
    }

    for (const trigger of this.triggers) {
      if (!trigger.variable || trigger.variable.trim() === '') {
        throw new Error('Trigger variable cannot be empty')
      }

      if (
        (trigger.operation === 'is_above' || trigger.operation === 'is_below') &&
        (trigger.targetValue === undefined || trigger.targetValue === null)
      ) {
        throw new Error(`Target value is required for ${trigger.operation} operation`)
      }
    }
  }

  private logNotification(notification: Notification, success: boolean): void {
    const status = success ? 'SUCCESS' : 'FAILED'
    console.log(`[${status}] ${this.name} notification: ${notification.title}`)
  }

  async sendTestNotification(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const testNotification: Notification = {
        title: '[PeaNUT]: Test Notification',
        message: 'Test notification sent from PeaNUT',
        timestamp: new Date(),
      }
      this.send(testNotification)
        .then(() => {
          resolve('Notification sent')
        })
        .catch((error: any) => {
          console.error(error?.message)
          reject(new Error(error?.message))
        })
    })
  }

  private validateDevices(dev1: DEVICE, dev2: DEVICE, trigger: NotificationTrigger): void {
    if (dev1.name !== dev2.name) {
      throw Error(`Device mismatch (${dev1.name} != ${dev2.name}) when processing triggers for ${this.name} notifier`)
    }
    if (!(Object.hasOwn(dev1.vars, trigger.variable) && Object.hasOwn(dev2.vars, trigger.variable))) {
      throw Error(`Variable ${trigger.variable} not found in device ${dev1.name}`)
    }
  }

  private handleChangesTrigger(
    dev1: DEVICE,
    dev2: DEVICE,
    trigger: NotificationTrigger,
    timestamp: Date
  ): Notification | null {
    const p1 = dev1.vars[trigger.variable]
    const p2 = dev2.vars[trigger.variable]
    if (p1.value != p2.value) {
      return {
        title: `[PeaNUT]: ${dev1.name} ${trigger.variable} changed from ${p1.value} to ${p2.value}`,
        timestamp,
      }
    }
    return null
  }

  private handleThresholdTrigger(
    dev1: DEVICE,
    dev2: DEVICE,
    trigger: NotificationTrigger,
    timestamp: Date,
    isAbove: boolean
  ): Notification | null {
    const targetValue = trigger.targetValue as number
    const p1 = dev1.vars[trigger.variable]
    const p2 = dev2.vars[trigger.variable]
    const p1Value = p1.value as number
    const p2Value = p2.value as number

    if (isAbove && p1Value < targetValue && p2Value > targetValue) {
      return {
        title: `[PeaNUT]: ${dev1.name} ${trigger.variable} is above ${targetValue} (${p2.value})`,
        timestamp,
      }
    }
    if (!isAbove && p1Value > targetValue && p2Value < targetValue) {
      return {
        title: `[PeaNUT]: ${dev1.name} ${trigger.variable} is below ${targetValue} (${p2.value})`,
        timestamp,
      }
    }
    return null
  }

  processTriggers(dev1: DEVICE, dev2: DEVICE): Array<Notification> {
    const timestamp = new Date()
    const notifications: Array<Notification> = []

    for (const trigger of this.triggers) {
      this.validateDevices(dev1, dev2, trigger)

      let notification: Notification | null = null
      if (trigger.operation === 'changes') {
        notification = this.handleChangesTrigger(dev1, dev2, trigger, timestamp)
      } else if (trigger.operation === 'is_above') {
        notification = this.handleThresholdTrigger(dev1, dev2, trigger, timestamp, true)
      } else if (trigger.operation === 'is_below') {
        notification = this.handleThresholdTrigger(dev1, dev2, trigger, timestamp, false)
      }

      // Add rate limiting check
      if (notification && this.shouldSendNotification(`${dev1.name}-${trigger.variable}-${trigger.operation}`)) {
        notifications.push(notification)
      }
    }
    return notifications
  }
}
