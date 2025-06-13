import { Notification, NotificationProviders, NotificationTrigger } from '@/common/types'
import { Notifier } from '@/server/notifications/notifier'

export type StdoutConfig = {
  [key: string]: string
}

export class Stdout extends Notifier {
  constructor(
    name: (typeof NotificationProviders)[number],
    triggers: Array<NotificationTrigger>,
    config: StdoutConfig
  ) {
    super(name, triggers)
    this.config = { ...config }
  }

  async send(notification: Notification) {
    console.log(
      notification.title,
      notification.message,
      '\n',
      `\tTriggers => ${JSON.stringify(this.triggers)}`,
      '\n',
      `\tConfiguration => ${JSON.stringify(this.config)}`
    )
  }
}
