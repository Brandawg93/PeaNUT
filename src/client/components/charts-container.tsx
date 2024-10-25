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
        inputVoltage={parseFloat(vars['input.voltage'].value.toString())}
        inputVoltageNominal={parseFloat(vars['input.voltage.nominal']?.value.toString())}
        outputVoltage={parseFloat(vars['output.voltage']?.value.toString())}
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
        realpower={parseFloat(vars['ups.realpower'].value.toString())}
        realpowerNominal={parseFloat(vars['ups.realpower.nominal']?.value.toString())}
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
