import { DEVICE, Notification, NotificationProviders, NotificationTrigger } from '@/common/types'

export abstract class Notifier {
  name: (typeof NotificationProviders)[number]
  triggers: Array<NotificationTrigger>
  config?: { [x: string]: any }

  constructor(name: (typeof NotificationProviders)[number], triggers: Array<NotificationTrigger>) {
    this.name = name
    this.triggers = triggers
  }

  abstract send(notification: Notification): Promise<void>

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

      if (notification) {
        notifications.push(notification)
      }
    }
    return notifications
  }
}
