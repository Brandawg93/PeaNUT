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
    this.validateNtfyConfig()
  }

  private validateNtfyConfig(): void {
    if (!this.config.server_url || this.config.server_url.trim() === '') {
      throw new Error('Ntfy server URL is required')
    }
    if (!this.config.topic || this.config.topic.trim() === '') {
      throw new Error('Ntfy topic is required')
    }
    if (!this.config.priority) {
      throw new Error('Ntfy priority is required')
    }
  }

  async sendInternal(notification: Notification): Promise<void> {
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
