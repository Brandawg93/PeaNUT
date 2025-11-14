'use client'

import React, { useMemo } from 'react'
import { VARS, DeviceData } from '@/common/types'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import WattsChart from '@/client/components/line-charts/watts-chart'
import VoltAmpsChart from '@/client/components/line-charts/volt-amps-chart'
import TemperatureChart from '@/client/components/line-charts/temperature-chart'

type Props = Readonly<{
  vars: VARS
  data: DeviceData
  name: string
}>

export default function ChartsContainer({ vars, data, name }: Props) {
  const voltageWrapper = useMemo(
    () =>
      vars['input.voltage'] ? (
        <div className='mb-4'>
          <VoltsChart
            id={name}
            inputVoltage={+vars['input.voltage'].value}
            inputVoltageNominal={+vars['input.voltage.nominal']?.value}
            outputVoltage={+vars['output.voltage']?.value}
            outputVoltageNominal={+vars['output.voltage.nominal']?.value}
            updated={data.updated}
          />
        </div>
      ) : (
        <></>
      ),
    [vars, data.updated, name]
  )

  const temperatureWrapper = useMemo(() => {
    const hasAmbientTemperature = vars['ambient.temperature']
    const hasBatteryTemperature = vars['battery.temperature']

    if (!hasAmbientTemperature && !hasBatteryTemperature) {
      return <></>
    }

    return (
      <div className='mb-4'>
        <TemperatureChart
          id={name}
          ambientTemperature={hasAmbientTemperature ? +hasAmbientTemperature.value : undefined}
          batteryTemperature={hasBatteryTemperature ? +hasBatteryTemperature.value : undefined}
          updated={data.updated}
        />
      </div>
    )
  }, [vars, data.updated, name])

  const wattsWrapper = useMemo(
    () =>
      vars['ups.realpower'] ? (
        <div className='mb-4'>
          <WattsChart
            id={name}
            realpower={+vars['ups.realpower'].value}
            realpowerNominal={+vars['ups.realpower.nominal']?.value}
            updated={data.updated}
          />
        </div>
      ) : (
        <></>
      ),
    [vars, data.updated, name]
  )

  const voltAmpsWrapper = useMemo(
    () =>
      vars['ups.power'] ? (
        <div className='mb-4'>
          <VoltAmpsChart
            id={name}
            power={+vars['ups.power'].value}
            powerNominal={+vars['ups.power.nominal']?.value}
            updated={data.updated}
          />
        </div>
      ) : (
        <></>
      ),
    [vars, data.updated, name]
  )

  return (
    <>
      {voltageWrapper}
      {temperatureWrapper}
      {wattsWrapper}
      {voltAmpsWrapper}
    </>
  )
}
