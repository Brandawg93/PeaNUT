import type { VARS } from '@/common/types'

function numericValue(vars: VARS, key: string): number | undefined {
  const value = vars[key]?.value
  if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
    return undefined
  }
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function phaseValues(vars: VARS, metric: string): number[] | undefined {
  if (numericValue(vars, 'output.phases') !== 3) return undefined
  const values = [1, 2, 3].map((phase) => numericValue(vars, `output.L${phase}.${metric}`))
  // Require all phases so missing readings cannot understate load or total power.
  return values.every((value) => value !== undefined) ? values : undefined
}

/** Resolve display metrics without changing the raw NUT variables. */
export function getUpsMetrics(vars: VARS) {
  const reportedLoad = numericValue(vars, 'ups.load')
  const phaseLoads = reportedLoad === undefined ? phaseValues(vars, 'power.percent') : undefined
  // The busiest phase limits a three-phase UPS, even when its average load is low.
  const load = reportedLoad ?? (phaseLoads ? Math.max(...phaseLoads) : undefined)

  const reportedRealpower = numericValue(vars, 'ups.realpower') ?? numericValue(vars, 'output.realpower')
  const phasePowers = reportedRealpower === undefined ? phaseValues(vars, 'realpower') : undefined
  const realpower = reportedRealpower ?? phasePowers?.reduce((sum, value) => sum + value, 0)
  const realpowerNominal = numericValue(vars, 'ups.realpower.nominal') ?? numericValue(vars, 'output.realpower.nominal')

  // Only estimate watts from an overall load, never from the busiest phase.
  const wattage =
    realpower ??
    (reportedLoad !== undefined && realpowerNominal !== undefined ? (reportedLoad / 100) * realpowerNominal : undefined)

  return { load, realpower, realpowerNominal, wattage }
}
