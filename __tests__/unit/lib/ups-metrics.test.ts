import { getUpsMetrics } from '@/lib/ups-metrics'
import { threePhaseVars } from '../../__mocks__/chartData'

describe('getUpsMetrics', () => {
  it.each([0, '0', 50, '50'])('prefers the reported overall load %p over phase readings', (value) => {
    expect(getUpsMetrics({ ...threePhaseVars, 'ups.load': { value } }).load).toBe(Number(value))
  })

  it('uses the busiest phase and sums phase watts for the issue 482 device', () => {
    expect(getUpsMetrics(threePhaseVars)).toEqual({
      load: 11,
      realpower: 16600,
      realpowerNominal: 180000,
      wattage: 16600,
    })
    expect(threePhaseVars['ups.load']).toBeUndefined()
    expect(threePhaseVars['ups.realpower']).toBeUndefined()
  })

  it('accepts numeric strings and zeroes in all phases', () => {
    expect(
      getUpsMetrics({
        'output.phases': { value: '3' },
        ...Object.fromEntries(
          [1, 2, 3].flatMap((phase) => [
            [`output.L${phase}.power.percent`, { value: '0' }],
            [`output.L${phase}.realpower`, { value: 0 }],
          ])
        ),
      })
    ).toMatchObject({ load: 0, realpower: 0, wattage: 0 })
  })

  it.each(['ups.realpower', 'output.realpower'])('preserves a reported zero in %s', (key) => {
    expect(getUpsMetrics({ ...threePhaseVars, [key]: { value: 0 } }).realpower).toBe(0)
  })

  it('prefers UPS watts and nominal ratings over output readings', () => {
    expect(
      getUpsMetrics({
        ...threePhaseVars,
        'ups.realpower': { value: 100 },
        'output.realpower': { value: 200 },
        'ups.realpower.nominal': { value: 1000 },
      })
    ).toMatchObject({ realpower: 100, realpowerNominal: 1000, wattage: 100 })
  })

  it.each(['', ' ', 'N/A', 'NaN', 'Infinity', Number.NaN, Number.POSITIVE_INFINITY])(
    'falls back from invalid overall readings %p',
    (value) => {
      expect(getUpsMetrics({ ...threePhaseVars, 'ups.load': { value }, 'ups.realpower': { value } })).toMatchObject({
        load: 11,
        realpower: 16600,
      })
    }
  )

  it.each(['output.L2.power.percent', 'output.L2.realpower'])(
    'requires complete valid phase readings for %s',
    (key) => {
      const vars = { ...threePhaseVars }
      delete vars[key]
      expect(key.endsWith('percent') ? getUpsMetrics(vars).load : getUpsMetrics(vars).realpower).toBeUndefined()

      vars[key] = { value: 'N/A' }
      expect(key.endsWith('percent') ? getUpsMetrics(vars).load : getUpsMetrics(vars).realpower).toBeUndefined()
    }
  )

  it.each([1, 2, 0, 'unknown'])('does not use three-phase fallbacks for output.phases=%p', (value) => {
    expect(getUpsMetrics({ ...threePhaseVars, 'output.phases': { value } })).toMatchObject({
      load: undefined,
      realpower: undefined,
      wattage: undefined,
    })
  })

  it('requires the phase count to be reported', () => {
    const vars = { ...threePhaseVars }
    delete vars['output.phases']
    expect(getUpsMetrics(vars)).toMatchObject({ load: undefined, realpower: undefined })
  })

  it('leaves missing metrics unavailable', () => {
    expect(getUpsMetrics({})).toEqual({
      load: undefined,
      realpower: undefined,
      realpowerNominal: undefined,
      wattage: undefined,
    })
  })

  it.each([0, 50])('retains the wattage estimate for an overall load of %p', (value) => {
    expect(getUpsMetrics({ 'ups.load': { value }, 'ups.realpower.nominal': { value: 1000 } }).wattage).toBe(value * 10)
  })

  it('does not estimate total watts from the busiest phase', () => {
    const vars = { ...threePhaseVars }
    for (const phase of [1, 2, 3]) delete vars[`output.L${phase}.realpower`]
    expect(getUpsMetrics(vars)).toMatchObject({ load: 11, wattage: undefined })
  })
})
