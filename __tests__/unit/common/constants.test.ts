import { parseUpsStatus } from '@/common/constants'

describe('parseUpsStatus', () => {
  describe('single status values', () => {
    const singleStatusTests = [
      { input: 'OL', expected: 'Online' },
      { input: 'OB', expected: 'On Battery' },
      { input: 'LB', expected: 'Low Battery' },
      { input: 'HE', expected: 'ECO Mode' },
      { input: 'TEST', expected: 'Battery Testing' },
    ]

    test.each(singleStatusTests)('should parse "$input" as "$expected"', ({ input, expected }) => {
      expect(parseUpsStatus(input)).toBe(expected)
    })
  })

  describe('combined status values', () => {
    const combinedStatusTests = [
      { input: 'OL CHRG', expected: 'Online, Battery Charging' },
      { input: 'OL CHRG LB', expected: 'Online, Battery Charging, Low Battery' },
      { input: 'OB LB', expected: 'On Battery, Low Battery' },
      { input: 'OL HE', expected: 'Online, ECO Mode' },
      { input: 'OL TEST', expected: 'Online, Battery Testing' },
    ]

    test.each(combinedStatusTests)('should parse "$input" as "$expected"', ({ input, expected }) => {
      expect(parseUpsStatus(input)).toBe(expected)
    })
  })

  describe('unknown status handling', () => {
    const unknownStatusTests = [
      { input: 'OL UNKNOWN_STATUS', expected: 'Online, UNKNOWN_STATUS' },
      { input: 'UNKNOWN_STATUS LB', expected: 'UNKNOWN_STATUS, Low Battery' },
      { input: 'UNKNOWN_STATUS1 UNKNOWN_STATUS2', expected: 'UNKNOWN_STATUS1, UNKNOWN_STATUS2' },
    ]

    test.each(unknownStatusTests)('should handle "$input" gracefully as "$expected"', ({ input, expected }) => {
      expect(parseUpsStatus(input)).toBe(expected)
    })
  })

  describe('edge cases', () => {
    const edgeCaseTests = [
      { input: '', expected: '' },
      { input: null as any, expected: '' },
      { input: undefined as any, expected: '' },
      { input: ' CHRG ', expected: 'Battery Charging' }, // Trims whitespace
    ]

    test.each(edgeCaseTests)('should handle "$input" as "$expected"', ({ input, expected }) => {
      expect(parseUpsStatus(input)).toBe(expected)
    })
  })

  describe('status order preservation', () => {
    const orderTests = [
      { input: 'LB OL CHRG', expected: 'Low Battery, Online, Battery Charging' },
      { input: 'CHRG OL LB', expected: 'Battery Charging, Online, Low Battery' },
    ]

    test.each(orderTests)('should maintain order for "$input" as "$expected"', ({ input, expected }) => {
      expect(parseUpsStatus(input)).toBe(expected)
    })
  })
})
