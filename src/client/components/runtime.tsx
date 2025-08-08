import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
import Kpi from '@/client/components/kpi'

const TIME_CONSTANTS = {
  DAY: 3600 * 24,
  HOUR: 3600,
  MINUTE: 60,
} as const

function secondsToDhms(seconds: number): string {
  if (seconds <= 0) {
    return 'N/A'
  }

  const d = Math.floor(seconds / TIME_CONSTANTS.DAY)
  const h = Math.floor((seconds % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR)
  const m = Math.floor((seconds % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE)
  const s = Math.floor(seconds % TIME_CONSTANTS.MINUTE)

  const parts = [
    d > 0 && `${d} ${d === 1 ? 'day' : 'days'}`,
    h > 0 && `${h} ${h === 1 ? 'hour' : 'hours'}`,
    m > 0 && `${m} ${m === 1 ? 'minute' : 'minutes'}`,
    s > 0 && `${s} ${s === 1 ? 'second' : 'seconds'}`,
  ].filter(Boolean)

  return parts.join(', ')
}

// Calculate runtime using battery capacity and current load
function calculateRuntimeFromCapacity(
  batteryCapacity?: number,
  batteryVoltage?: number,
  batteryCharge?: number,
  upsLoad?: number,
  upsRealpowerNominal?: number
): number {
  // If we have battery capacity in Ah and voltage, we can estimate runtime
  if (batteryCapacity && batteryVoltage && batteryCharge && upsLoad && upsRealpowerNominal) {
    // Convert battery capacity from Ah to Wh
    const batteryCapacityWh = batteryCapacity * batteryVoltage * (batteryCharge / 100)

    // Calculate current power consumption in watts
    const currentPowerW = (upsLoad / 100) * upsRealpowerNominal

    // Runtime = Battery capacity (Wh) / Current power (W)
    const runtimeHours = batteryCapacityWh / currentPowerW

    // Convert to seconds
    return runtimeHours * 3600
  }

  return 0
}

// Calculate runtime using battery charge percentage and load
function calculateRuntimeFromCharge(batteryCharge?: number, upsLoad?: number, upsRealpowerNominal?: number): number {
  // Simple estimation based on charge percentage and load
  // This is a rough estimate assuming linear discharge
  if (batteryCharge && upsLoad && upsRealpowerNominal) {
    // Assume full battery can provide 1 hour at full load
    const fullLoadRuntime = 3600 // 1 hour in seconds
    const loadFactor = upsLoad / 100
    const chargeFactor = batteryCharge / 100

    // Runtime = Full load runtime * charge factor / load factor
    return (fullLoadRuntime * chargeFactor) / loadFactor
  }

  return 0
}

type Props = Readonly<{
  runtime: number
  // Optional variables for fallback calculation
  batteryCapacity?: number
  batteryVoltage?: number
  batteryCharge?: number
  upsLoad?: number
  upsRealpowerNominal?: number
}>

export default function Runtime({
  runtime,
  batteryCapacity,
  batteryVoltage,
  batteryCharge,
  upsLoad,
  upsRealpowerNominal,
}: Props) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const calculatedRuntime = useMemo(() => {
    // If runtime is provided and valid, use it
    if (runtime > 0) {
      return runtime
    }

    // Try to calculate runtime using battery capacity
    const capacityRuntime = calculateRuntimeFromCapacity(
      batteryCapacity,
      batteryVoltage,
      batteryCharge,
      upsLoad,
      upsRealpowerNominal
    )

    if (capacityRuntime > 0) {
      return capacityRuntime
    }

    // Fallback to charge-based calculation
    const chargeRuntime = calculateRuntimeFromCharge(batteryCharge, upsLoad, upsRealpowerNominal)

    return chargeRuntime
  }, [runtime, batteryCapacity, batteryVoltage, batteryCharge, upsLoad, upsRealpowerNominal])

  const formattedTime = useMemo(() => secondsToDhms(calculatedRuntime), [calculatedRuntime])

  return (
    <div className='text-3xl' data-testid='runtime'>
      <Kpi text={formattedTime} description={t('batteryRuntime')} />
    </div>
  )
}
