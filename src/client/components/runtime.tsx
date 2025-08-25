import React, { useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageContext } from '@/client/context/language'
import Kpi from '@/client/components/kpi'
import { secondsToDhms } from '@/lib/utils'

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
