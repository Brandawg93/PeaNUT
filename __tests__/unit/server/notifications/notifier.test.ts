import { Notifier } from '@/server/notifications/notifier'
import { NotificationProviders, NotificationTrigger, DEVICE, Notification } from '@/common/types'

// Create a concrete implementation for testing
class TestNotifier extends Notifier {
  constructor(name: (typeof NotificationProviders)[number], triggers: Array<NotificationTrigger>) {
    super(name, triggers)
  }

  async sendInternal(_notification: Notification): Promise<void> {
    // Mock implementation
    return Promise.resolve()
  }

  // Expose rate limit for testing
  getRateLimit(): number {
    return this['RATE_LIMIT_MS']
  }
}

describe('Notifier', () => {
  const mockDevice: DEVICE = {
    name: 'test-ups',
    description: 'Test UPS',
    vars: {
      'battery.charge': { value: 50, description: 'Battery charge percentage' },
      'ups.status': { value: 'OL', description: 'UPS status' },
    },
    rwVars: [],
    commands: [],
    clients: [],
  }

  const mockDevice2: DEVICE = {
    name: 'test-ups',
    description: 'Test UPS',
    vars: {
      'battery.charge': { value: 45, description: 'Battery charge percentage' },
      'ups.status': { value: 'OB', description: 'UPS status' },
    },
    rwVars: [],
    commands: [],
    clients: [],
  }

  describe('validation', () => {
    it('should throw error when no triggers are provided', () => {
      expect(() => new TestNotifier('stdout', [])).toThrow('At least one trigger must be configured')
    })

    it('should throw error when trigger variable is empty', () => {
      const triggers: NotificationTrigger[] = [{ variable: '', operation: 'changes' }]
      expect(() => new TestNotifier('stdout', triggers)).toThrow('Trigger variable cannot be empty')
    })

    it('should throw error when is_above operation has no target value', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_above' }]
      expect(() => new TestNotifier('stdout', triggers)).toThrow('Target value is required for is_above operation')
    })

    it('should throw error when is_below operation has no target value', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_below' }]
      expect(() => new TestNotifier('stdout', triggers)).toThrow('Target value is required for is_below operation')
    })

    it('should not throw error for valid changes trigger', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      expect(() => new TestNotifier('stdout', triggers)).not.toThrow()
    })

    it('should not throw error for valid threshold trigger', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_above', targetValue: 20 }]
      expect(() => new TestNotifier('stdout', triggers)).not.toThrow()
    })
  })

  describe('rate limiting', () => {
    it('should allow first notification', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      const notifications = notifier.processTriggers(mockDevice, mockDevice2)
      expect(notifications).toHaveLength(1)
    })

    it('should rate limit subsequent notifications', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      // First notification should work
      const notifications1 = notifier.processTriggers(mockDevice, mockDevice2)
      expect(notifications1).toHaveLength(1)

      // Second notification within rate limit should be blocked
      const notifications2 = notifier.processTriggers(mockDevice, mockDevice2)
      expect(notifications2).toHaveLength(0)
    })

    it('should use configurable rate limit from settings', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      // Should use default rate limit (60000ms = 1 minute)
      expect(notifier.getRateLimit()).toBe(60000)
    })
  })

  describe('trigger processing', () => {
    it('should detect changes in variable values', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      const notifications = notifier.processTriggers(mockDevice, mockDevice2)
      expect(notifications).toHaveLength(1)
      expect(notifications[0].title).toContain('changed from 50 to 45')
    })

    it('should detect when value goes above threshold', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_above', targetValue: 40 }]
      const notifier = new TestNotifier('stdout', triggers)

      // Create devices where value goes from below to above threshold
      const device1 = { ...mockDevice, vars: { 'battery.charge': { value: 35 } } }
      const device2 = { ...mockDevice2, vars: { 'battery.charge': { value: 45 } } }

      const notifications = notifier.processTriggers(device1, device2)
      expect(notifications).toHaveLength(1)
      expect(notifications[0].title).toContain('is above 40')
    })

    it('should detect when value goes below threshold', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_below', targetValue: 50 }]
      const notifier = new TestNotifier('stdout', triggers)

      // Create devices where value goes from above to below threshold
      const device1 = { ...mockDevice, vars: { 'battery.charge': { value: 55 } } }
      const device2 = { ...mockDevice2, vars: { 'battery.charge': { value: 45 } } }

      const notifications = notifier.processTriggers(device1, device2)
      expect(notifications).toHaveLength(1)
      expect(notifications[0].title).toContain('is below 50')
    })

    it('should not trigger when value does not cross threshold', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'is_above', targetValue: 40 }]
      const notifier = new TestNotifier('stdout', triggers)

      // Create devices where value stays below threshold
      const device1 = { ...mockDevice, vars: { 'battery.charge': { value: 35 } } }
      const device2 = { ...mockDevice2, vars: { 'battery.charge': { value: 38 } } }

      const notifications = notifier.processTriggers(device1, device2)
      expect(notifications).toHaveLength(0)
    })
  })

  describe('error handling', () => {
    it('should throw error for device mismatch', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'battery.charge', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      const device1 = { ...mockDevice, name: 'ups1' }
      const device2 = { ...mockDevice2, name: 'ups2' }

      expect(() => notifier.processTriggers(device1, device2)).toThrow('Device mismatch')
    })

    it('should throw error for missing variable', () => {
      const triggers: NotificationTrigger[] = [{ variable: 'nonexistent.var', operation: 'changes' }]
      const notifier = new TestNotifier('stdout', triggers)

      expect(() => notifier.processTriggers(mockDevice, mockDevice2)).toThrow('Variable nonexistent.var not found')
    })
  })
})
