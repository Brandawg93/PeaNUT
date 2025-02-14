import { Notification, NotificationProviders, NotificationTrigger } from '@/common/types'
import { Notifier } from '@/server/notifications/notifier'

export type NtfyConfig = {
  server_url: string
  username?: string
  password?: string
  accessToken?: string
  topic: string
  priority: number | string
  tags: string
}

export class Ntfy extends Notifier {
  config: NtfyConfig
  authMethod: 'token' | 'password' | 'none'

  constructor(name: (typeof NotificationProviders)[number], triggers: Array<NotificationTrigger>, config: NtfyConfig) {
    super(name, triggers)
    this.config = config
    this.authMethod = 'none'
    if (this.config.accessToken && this.config.accessToken.length > 0) {
      this.authMethod = 'token'
    } else if (
      this.config.username &&
      this.config.username.length > 0 &&
      this.config.password &&
      this.config.password.length > 0
    ) {
      this.authMethod = 'password'
    }
  }

  async send(notification: Notification) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    if (this.authMethod == 'token') {
      headers['Authorization'] = `Bearer ${this.config.accessToken}`
    } else if (this.authMethod == 'password') {
      headers['Authorization'] =
        `Basic ${Buffer.from(this.config.username + ':' + this.config.password).toString('base64')}`
    }
    try {
      console.log('sending to ' + this.config.server_url)
      console.log(
        JSON.stringify({
          topic: this.config.topic,
          message: notification.message,
          priority: this.config.priority,
          title: notification.title,
          tags: this.config.tags.split(','),
        })
      )
      const req = await fetch(this.config.server_url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          topic: this.config.topic,
          message: notification.message,
          priority: +this.config.priority,
          title: notification.title,
          tags: this.config.tags.split(','),
        }),
      })
      const resp = await req.json()
      if (resp.http < 200 || resp.http >= 400) {
        throw new Error(JSON.stringify(resp))
      }
    } catch (err) {
      console.log(`Error sending ${this.name} notification`)
      throw err
    }
  }
}
