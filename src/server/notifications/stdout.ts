import { Notification, NotificationProviders, NotificationTrigger } from '@/common/types'
import { Notifier } from '@/server/notifications/notifier'

export class Stdout extends Notifier {
  constructor(name: (typeof NotificationProviders)[number], triggers: Array<NotificationTrigger>) {
    super(name, triggers)
  }

  async send(notification: Notification) {
    console.log(notification.title, notification.message)
  }
}
