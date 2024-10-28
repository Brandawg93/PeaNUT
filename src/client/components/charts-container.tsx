'use client'

import 'chart.js/auto'
import React from 'react'
import { Chart } from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { VARS, DEVICE } from '@/common/types'
import LineChart from '@/client/components/line-chart'
import WattsChart from '@/client/components/watts-chart'

Chart.register(annotationPlugin)

type Props = {
  vars: VARS
  data: {
    devices: DEVICE[]
    updated: Date
    error: undefined
  }
  name: string
}

export default function ChartsContainer({ vars, data, name }: Props) {
  const voltageWrapper = vars['input.voltage'] ? (
    <div className='mb-4'>
      <LineChart
        id={name}
        inputVoltage={+vars['input.voltage'].value}
        inputVoltageNominal={+vars['input.voltage.nominal']?.value}
        outputVoltage={+vars['output.voltage']?.value}
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
  return (
    <>
      {voltageWrapper}
      {wattsWrapper}
    </>
  )
}
