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
  outputVoltageNominal?: number
  outputVoltage?: number
  updated: Date
}

export default function VoltsChart(props: Props) {
  const { id, inputVoltage, inputVoltageNominal, outputVoltage, outputVoltageNominal, updated } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [inputVoltageData, setInputVoltageData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [outputVoltageData, setOutputVoltageData] = useState<Array<{ dataPoint: number; time: Date }>>([])
  const [showInputVoltage, setShowInputVoltage] = useState<boolean>(true)
  const [showOutputVoltage, setShowOutputVoltage] = useState<boolean>(true)
  const prevDataRef = useRef(id)
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
      referenceLineData={referenceLineData}
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
