import React, { useEffect, useState, useRef, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import './charts.css'
import LineChart from './line-chart-base'
import { Payload } from 'recharts/types/component/DefaultLegendContent'

type Props = {
  id: string
  inputVoltage?: number
  inputVoltageNominal?: number
  outputVoltage?: number
  updated: Date
}

export default function VoltsChart(props: Props) {
  const { id, inputVoltage, inputVoltageNominal, outputVoltage, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [inputVoltageData, setInputVoltageData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [outputVoltageData, setOutputVoltageData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [showInputVoltage, setShowInputVoltage] = useState<boolean>(true)
  const [showOutputVoltage, setShowOutputVoltage] = useState<boolean>(true)
  const prevDataRef = useRef(id)

  const handleLegendClick = (payload: Payload) => {
    if (payload.value === 'inputVoltage') {
      setShowInputVoltage(!showInputVoltage)
    } else if (payload.value === 'outputVoltage') {
      setShowOutputVoltage(!showOutputVoltage)
    }
  }

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (inputVoltage) setInputVoltageData([{ dataPoint: inputVoltage, time: new Date() }])
      else setInputVoltageData([])
      if (outputVoltage) setOutputVoltageData([{ dataPoint: outputVoltage, time: new Date() }])
      else setOutputVoltageData([])
    } else {
      if (inputVoltage) setInputVoltageData((prev) => [...prev, { dataPoint: inputVoltage, time: new Date() }])
      if (outputVoltage) setOutputVoltageData((prev) => [...prev, { dataPoint: outputVoltage, time: new Date() }])
    }
    prevDataRef.current = id
  }, [id, inputVoltage, outputVoltage, updated])

  return (
    <LineChart
      id='volts-chart'
      onLegendClick={handleLegendClick}
      referenceLineValue={inputVoltageNominal}
      referenceLineLabel={t('voltsChart.nominalInputVoltage')}
      config={{
        time: {
          label: 'Time',
        },
        inputVoltage: {
          label: t('voltsChart.inputVoltage'),
          color: 'hsl(var(--chart-1))',
        },
        outputVoltage: {
          label: t('voltsChart.outputVoltage'),
          color: 'hsl(var(--chart-2))',
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
