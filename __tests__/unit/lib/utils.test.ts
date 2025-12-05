import { secondsToDhms, parseDeviceId } from '@/lib/utils'

describe('utils', () => {
  describe('secondsToDhms', () => {
    it.each([
      [0, 'N/A'],
      [-1, 'N/A'],
      [30, '30 seconds'],
      [1, '1 second'],
      [60, '1 minute'],
      [120, '2 minutes'],
      [3600, '1 hour'],
      [7200, '2 hours'],
      [86400, '1 day'],
      [172800, '2 days'],
      [90061, '1 day, 1 hour, 1 minute, 1 second'],
    ])('formats %i seconds as "%s"', (input, expected) => {
      expect(secondsToDhms(input)).toBe(expected)
    })
  })

  describe('parseDeviceId', () => {
    it.each([
      // [input, expected, description]
      ['192.168.1.10_3493_ups', { host: '192.168.1.10', port: 3493, name: 'ups' }, 'URL-safe format'],
      ['localhost_3493_test-device', { host: 'localhost', port: 3493, name: 'test-device' }, 'localhost'],
      [
        '192.168.1.10_3493_my-ups-device',
        { host: '192.168.1.10', port: 3493, name: 'my-ups-device' },
        'hyphenated name',
      ],
      ['my_server_3493_ups', { host: 'my_server', port: 3493, name: 'ups' }, 'hostname with underscores'],
    ])('parses "%s" correctly (%s)', (input, expected) => {
      expect(parseDeviceId(input)).toEqual(expected)
    })

    it.each([
      ['ups', { name: 'ups' }, 'simple device name'],
      ['some_text_here', { name: 'some_text_here' }, 'non-numeric port treated as legacy'],
    ])('treats "%s" as legacy format (%s)', (input, expected) => {
      expect(parseDeviceId(input)).toEqual(expected)
    })
  })
})
