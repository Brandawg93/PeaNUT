import { secondsToDhms, parseDeviceId } from '@/lib/utils'

describe('utils', () => {
  describe('secondsToDhms', () => {
    it('returns N/A for zero or negative seconds', () => {
      expect(secondsToDhms(0)).toBe('N/A')
      expect(secondsToDhms(-1)).toBe('N/A')
    })

    it('formats seconds correctly', () => {
      expect(secondsToDhms(30)).toBe('30 seconds')
      expect(secondsToDhms(1)).toBe('1 second')
    })

    it('formats minutes correctly', () => {
      expect(secondsToDhms(60)).toBe('1 minute')
      expect(secondsToDhms(120)).toBe('2 minutes')
    })

    it('formats hours correctly', () => {
      expect(secondsToDhms(3600)).toBe('1 hour')
      expect(secondsToDhms(7200)).toBe('2 hours')
    })

    it('formats days correctly', () => {
      expect(secondsToDhms(86400)).toBe('1 day')
      expect(secondsToDhms(172800)).toBe('2 days')
    })

    it('formats combined time correctly', () => {
      expect(secondsToDhms(90061)).toBe('1 day, 1 hour, 1 minute, 1 second')
    })
  })

  describe('parseDeviceId', () => {
    it('parses URL-safe device ID format (host_port_name)', () => {
      const result = parseDeviceId('192.168.1.10_3493_ups')
      expect(result).toEqual({
        host: '192.168.1.10',
        port: 3493,
        name: 'ups',
      })
    })

    it('parses legacy device name format', () => {
      const result = parseDeviceId('ups')
      expect(result).toEqual({
        name: 'ups',
      })
    })

    it('handles localhost in URL-safe format', () => {
      const result = parseDeviceId('localhost_3493_test-device')
      expect(result).toEqual({
        host: 'localhost',
        port: 3493,
        name: 'test-device',
      })
    })

    it('handles device names with hyphens', () => {
      const result = parseDeviceId('192.168.1.10_3493_my-ups-device')
      expect(result).toEqual({
        host: '192.168.1.10',
        port: 3493,
        name: 'my-ups-device',
      })
    })

    it('handles hostnames with underscores', () => {
      // If host contains underscores, they are preserved
      const result = parseDeviceId('my_server_3493_ups')
      expect(result).toEqual({
        host: 'my_server',
        port: 3493,
        name: 'ups',
      })
    })

    it('treats non-numeric port as legacy format', () => {
      // If the second-to-last part isn't a valid port number, treat as legacy
      const result = parseDeviceId('some_text_here')
      expect(result).toEqual({
        name: 'some_text_here',
      })
    })
  })
})
