import React, { useContext, useEffect, useState } from 'react'
import { Card, CardContent } from '@/client/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/client/components/ui/chart'
import { CartesianGrid, Line, LineChart, XAxis, YAxis, ReferenceLine } from 'recharts'
import { Payload } from 'recharts/types/component/DefaultLegendContent'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/client/components/ui/accordion'
import { LanguageContext } from '@/client/context/language'
import { useTranslation } from 'react-i18next'

type ReferenceLineData = Array<{ label: string; value: number }>

type Props = Readonly<{
  id: string
  config: ChartConfig
  data: any[]
  unit: string
  onLegendClick?: (payload: Payload) => void
  referenceLineData?: ReferenceLineData
}>

export default function LineChartBase(props: Props) {
  const { referenceLineData, id, config, data, unit, onLegendClick } = props
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const [accordionValue, setAccordionValue] = useState<string | undefined>(id)

  useEffect(() => {
    // Get stored state from localStorage
    const storedState = localStorage.getItem(`accordion-${id}`)
    // Set to stored value if exists, otherwise default to open (id)
    setAccordionValue(storedState === 'closed' ? undefined : id)
  }, [id])

  const handleAccordionChange = (value: string) => {
    // Store the new state in localStorage
    localStorage.setItem(`accordion-${id}`, value === id ? 'open' : 'closed')
    setAccordionValue(value)
  }

  return (
    <Card className='border-border-card bg-card w-full border p-3 shadow-none' data-testid={id}>
      <CardContent className='p-0!'>
        <Accordion
          type='single'
          collapsible
          className='w-full'
          value={accordionValue}
          onValueChange={handleAccordionChange}
        >
          <AccordionItem value={id} className='border-b-0!'>
            <AccordionTrigger className='cursor-pointer p-0'>{t(id)}</AccordionTrigger>
            <AccordionContent className='pb-0!'>
              <ChartContainer config={config} className='mx-auto aspect-square h-96 w-full'>
                <LineChart accessibilityLayer data={data}>
                  <XAxis
                    dataKey='time'
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(timeStr: string) =>
                      new Date(timeStr).toLocaleTimeString(lng, {
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric',
                        hour12: localStorage.getItem('use24Hour') !== 'true',
                      })
                    }
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    domain={[
                      (dataMin: number) =>
                        referenceLineData !== undefined
                          ? Math.min(dataMin, ...referenceLineData.map((l) => l.value))
                          : dataMin,
                      (dataMax: number) =>
                        referenceLineData !== undefined
                          ? Math.max(dataMax, ...referenceLineData.map((l) => l.value))
                          : dataMax,
                    ]}
                    tickMargin={8}
                    tickFormatter={(value) => `${value}${unit}`}
                  />
                  <ChartLegend
                    verticalAlign='top'
                    content={<ChartLegendContent handleClick={(e: Payload) => onLegendClick && onLegendClick(e)} />}
                  />
                  <CartesianGrid horizontal vertical />
                  {referenceLineData?.map((line) => (
                    <ReferenceLine
                      key={line.label}
                      y={line.value}
                      stroke='red'
                      label={line.label}
                      strokeDasharray='4 4'
                    />
                  ))}
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        unit={unit}
                        labelKey='time'
                        labelFormatter={(value, payload) => {
                          const timeValue = (payload[0]?.payload as { time?: string })?.time
                          return new Date(timeValue ?? '').toLocaleTimeString(lng, {
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: localStorage.getItem('use24Hour') !== 'true',
                          })
                        }}
                      />
                    }
                  />
                  {data.length > 0 &&
                    Object.keys(data[0] as Record<string, unknown>)
                      .filter((k) => k !== 'time')
                      .map((key) => (
                        <Line
                          key={key}
                          dataKey={key}
                          type='monotone'
                          stroke={`var(--color-${key})`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                </LineChart>
              </ChartContainer>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
