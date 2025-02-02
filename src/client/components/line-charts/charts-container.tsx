'use client'

import React from 'react'
import { VARS, DeviceData } from '@/common/types'
import VoltsChart from '@/client/components/line-charts/volts-chart'
import WattsChart from '@/client/components/line-charts/watts-chart'
import VoltAmpsChart from '@/client/components/line-charts/volt-amps-chart'

type Props = {
  vars: VARS
  data: DeviceData
  name: string
}

export default function ChartsContainer({ vars, data, name }: Props) {
  const voltageWrapper = vars['input.voltage'] ? (
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
  )
  const wattsWrapper = vars['ups.realpower'] ? (
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
  )
  const voltAmpsWrapper = vars['ups.power'] ? (
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
  )
  return (
    <>
      {voltageWrapper}
      {wattsWrapper}
      {voltAmpsWrapper}
    </>
  )
}
