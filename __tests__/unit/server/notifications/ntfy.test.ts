import { Ntfy } from '@/server/notifications/ntfy'
import { NotificationTrigger } from '@/common/types'

describe('Ntfy', () => {
  const validTriggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]

  const validConfig = {
    server_url: 'https://ntfy.example.com',
    topic: 'peanut-alerts',
    priority: 3,
    tags: 'ups,alert',
  }

  describe('validation', () => {
    it('should throw error when server_url is missing', () => {
      const config = { ...validConfig, server_url: '' }
      expect(() => new Ntfy('ntfy', validTriggers, config)).toThrow('Ntfy server URL is required')
    })

    it('should throw error when topic is missing', () => {
      const config = { ...validConfig, topic: '' }
      expect(() => new Ntfy('ntfy', validTriggers, config)).toThrow('Ntfy topic is required')
    })

    it('should throw error when priority is missing', () => {
      const config = { ...validConfig, priority: undefined as any }
      expect(() => new Ntfy('ntfy', validTriggers, config)).toThrow('Ntfy priority is required')
    })

    it('should not throw error for valid config', () => {
      expect(() => new Ntfy('ntfy', validTriggers, validConfig)).not.toThrow()
    })
  })

  describe('authentication', () => {
    it('should set auth method to none when no credentials provided', () => {
      const ntfy = new Ntfy('ntfy', validTriggers, validConfig)
      expect(ntfy['authMethod']).toBe('none')
    })

    it('should set auth method to token when access token provided', () => {
      const config = { ...validConfig, accessToken: 'test-token' }
      const ntfy = new Ntfy('ntfy', validTriggers, config)
      expect(ntfy['authMethod']).toBe('token')
    })

    it('should set auth method to password when username and password provided', () => {
      const config = { ...validConfig, username: 'user', password: 'pass' }
      const ntfy = new Ntfy('ntfy', validTriggers, config)
      expect(ntfy['authMethod']).toBe('password')
    })
  })
})
