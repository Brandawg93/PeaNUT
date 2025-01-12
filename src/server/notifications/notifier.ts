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
          reject(error?.message)
        })
    })
  }

  processTriggers(dev1: DEVICE, dev2: DEVICE): Array<Notification> {
    const timestamp = new Date()
    const notifications: Array<Notification> = []
    for (const trigger of this.triggers) {
      if (dev1.name !== dev2.name) {
        throw Error(`Device mismatch (${dev1.name} != ${dev2.name}) when processing triggers for ${this.name} notifier`)
      }
      if (!(Object.hasOwn(dev1.vars, trigger.variable) && Object.hasOwn(dev2.vars, trigger.variable))) {
        throw Error(`Variable ${trigger.variable} not found in device ${dev1.name}`)
      }
      const p1 = dev1.vars[trigger.variable]
      const p2 = dev2.vars[trigger.variable]
      if (trigger.operation === 'changes') {
        if (p1.value != p2.value) {
          notifications.push({
            title: `[PeaNUT]: ${dev1.name} ${trigger.variable} changed from ${p1.value} to ${p2.value}`,
            timestamp,
          })
        }
      } else if (trigger.operation === 'is_above') {
        const targetValue = trigger.targetValue as number
        const p1Value = p1.value as number
        const p2Value = p2.value as number
        if (p1Value < targetValue && p2Value > targetValue) {
          notifications.push({
            title: `[PeaNUT]: ${dev1.name} ${trigger.variable} is above ${targetValue} (${p2.value})`,
            timestamp,
          })
        }
      } else if (trigger.operation === 'is_below') {
        const targetValue = trigger.targetValue as number
        const p1Value = p1.value as number
        const p2Value = p2.value as number
        if (p1Value > targetValue && p2Value < targetValue) {
          notifications.push({
            title: `[PeaNUT]: ${dev1.name} ${trigger.variable} is below ${targetValue} (${p2.value})`,
            timestamp,
          })
        }
      }
    }
    return notifications
  }
}
