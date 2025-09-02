import { parseUpsStatus, upsStatus } from '@/common/constants'

describe('parseUpsStatus', () => {
  it('should parse single status values correctly', () => {
    expect(parseUpsStatus('OL')).toBe('Online')
    expect(parseUpsStatus('OB')).toBe('On Battery')
    expect(parseUpsStatus('LB')).toBe('Low Battery')
    expect(parseUpsStatus('HE')).toBe('ECO Mode')
    expect(parseUpsStatus('TEST')).toBe('Battery Testing')
  })

  it('should parse combined status values dynamically', () => {
    expect(parseUpsStatus('OL CHRG')).toBe('Online, Battery Charging')
    expect(parseUpsStatus('OL CHRG LB')).toBe('Online, Battery Charging, Low Battery')
    expect(parseUpsStatus('OB LB')).toBe('On Battery, Low Battery')
    expect(parseUpsStatus('OL HE')).toBe('Online, ECO Mode')
    expect(parseUpsStatus('OL TEST')).toBe('Online, Battery Testing')
  })

  it('should handle unknown status parts gracefully', () => {
    expect(parseUpsStatus('OL UNKNOWN_STATUS')).toBe('Online, UNKNOWN_STATUS')
    expect(parseUpsStatus('UNKNOWN_STATUS LB')).toBe('UNKNOWN_STATUS, Low Battery')
    expect(parseUpsStatus('UNKNOWN_STATUS1 UNKNOWN_STATUS2')).toBe('UNKNOWN_STATUS1, UNKNOWN_STATUS2')
  })

  it('should handle empty and null values', () => {
    expect(parseUpsStatus('')).toBe('')
    expect(parseUpsStatus(null as any)).toBe('')
    expect(parseUpsStatus(undefined as any)).toBe('')
  })

  it('should handle single space-separated values', () => {
    expect(parseUpsStatus('OL')).toBe('Online')
    expect(parseUpsStatus(' CHRG ')).toBe('Battery Charging') // Trims whitespace and parses
  })

  it('should maintain order of status parts', () => {
    expect(parseUpsStatus('LB OL CHRG')).toBe('Low Battery, Online, Battery Charging')
    expect(parseUpsStatus('CHRG OL LB')).toBe('Battery Charging, Online, Low Battery')
  })
})
