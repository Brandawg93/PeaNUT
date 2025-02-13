import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import { useChartData } from './hooks/useChartData'
import { BaseChartProps } from './types/chart-types'

type Props = BaseChartProps & {
  inputVoltage?: number
  inputVoltageNominal?: number
  outputVoltageNominal?: number
  outputVoltage?: number
}

export default function VoltsChart(props: Props) {
  const { id, inputVoltage, inputVoltageNominal, outputVoltage, outputVoltageNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [showInputVoltage, setShowInputVoltage] = useState<boolean>(true)
  const [showOutputVoltage, setShowOutputVoltage] = useState<boolean>(true)

  const inputVoltageData = useChartData(id, updated, inputVoltage)
  const outputVoltageData = useChartData(id, updated, outputVoltage)

  const referenceLineData = []
  if (inputVoltageNominal && outputVoltageNominal && inputVoltageNominal === outputVoltageNominal) {
    referenceLineData.push({ label: t('voltsChart.nominalVoltage'), value: inputVoltageNominal })
  } else {
    if (inputVoltageNominal) {
      referenceLineData.push({ label: t('voltsChart.nominalInputVoltage'), value: inputVoltageNominal })
    }
    if (outputVoltageNominal) {
      referenceLineData.push({ label: t('voltsChart.nominalOutputVoltage'), value: outputVoltageNominal })
    }
  }

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'inputVoltage') {
      setShowInputVoltage(!showInputVoltage)
    } else if (payload.value === 'outputVoltage') {
      setShowOutputVoltage(!showOutputVoltage)
    }
  }

  return (
    <LineChart
      id='volts-chart'
      onLegendClick={handleLegendClick}
      referenceLineData={referenceLineData}
      config={{
        time: {
          label: 'Time',
        },
        inputVoltage: {
          label: t('voltsChart.inputVoltage'),
          color: 'var(--chart-1)',
        },
        outputVoltage: {
          label: t('voltsChart.outputVoltage'),
          color: 'var(--chart-2)',
        },
      }}
      unit='V'
      data={inputVoltageData.map((v, i) => ({
        time: v.time,
        inputVoltage: inputVoltage && showInputVoltage ? v.dataPoint : undefined,
        outputVoltage:
          outputVoltage && i < outputVoltageData.length && showOutputVoltage
            ? outputVoltageData[i].dataPoint
            : undefined,
      }))}
    />
  )
}
