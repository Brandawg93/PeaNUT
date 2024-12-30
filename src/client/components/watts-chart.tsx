import React, { useEffect, useState, useRef, useContext } from 'react'
import { Card } from '@material-tailwind/react'
import { ResponsiveChartContainer } from '@mui/x-charts/ResponsiveChartContainer'
import { ChartsLegend } from '@mui/x-charts/ChartsLegend'
import { ChartsGrid } from '@mui/x-charts/ChartsGrid'
import { ChartsReferenceLine } from '@mui/x-charts/ChartsReferenceLine'
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart'
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis'
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { ThemeContext } from '../context/theme'

type Props = {
  id: string
  realpower?: number
  realpowerNominal?: number
  updated: Date
}

export default function WattsChart(props: Props) {
  const { id, realpower, realpowerNominal, updated } = props
  const [dataPoints, setDataPoints] = useState<Array<number>>([])
  const prevDataRef = useRef(id)
  const lng = useContext<string>(LanguageContext)
  const { theme } = useContext(ThemeContext)
  const darkTheme = createTheme({
    palette: {
      mode: theme,
    },
  })
  const { t } = useTranslation(lng)

  useEffect(() => {
    if (id !== prevDataRef.current) {
      if (realpower) setDataPoints([realpower])
      else setDataPoints([])
    } else {
      if (realpower) setDataPoints((prev: Array<number>) => [...prev, realpower])
    }
    prevDataRef.current = id
  }, [id, realpower, updated])

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Card
        className='border-neutral-300 h-96 w-full border border-solid border-gray-300 p-3 shadow-none dark:border-gray-800 dark:bg-gray-950'
        data-testid='watts'
      >
        <ResponsiveChartContainer
          height={300}
          series={[{ data: dataPoints, label: t('wattsChart.realpower'), type: 'line' }]}
          xAxis={[{ scaleType: 'point', data: dataPoints.map((value, index) => index) }]}
          yAxis={[
            {
              scaleType: 'linear',
              valueFormatter: (value: number) => `${value}V`,
              min: realpowerNominal ? Math.min(...dataPoints, realpowerNominal) : Math.min(...dataPoints),
              max: realpowerNominal ? Math.max(...dataPoints, realpowerNominal) : Math.max(...dataPoints),
            },
          ]}
        >
          <LinePlot />
          <MarkPlot />
          {realpowerNominal && (
            <ChartsReferenceLine
              y={realpowerNominal}
              label={t('wattsChart.nominalRealpower')}
              lineStyle={{ stroke: 'red', strokeDasharray: '10 5' }}
            />
          )}
          <ChartsXAxis disableTicks disableLine tickLabelStyle={{ display: 'none' }} />
          <ChartsYAxis />
          <ChartsLegend />
          <ChartsGrid horizontal vertical />
        </ResponsiveChartContainer>
      </Card>
    </ThemeProvider>
  )
}
