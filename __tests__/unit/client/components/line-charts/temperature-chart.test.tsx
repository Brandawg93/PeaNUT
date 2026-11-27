import React from 'react'
import { render } from '@testing-library/react'
import TemperatureChart from '@/client/components/line-charts/temperature-chart'
import LineChartBase from '@/client/components/line-charts/line-chart-base'
import { LanguageContext } from '@/client/context/language'
import { useChartData } from '@/client/components/line-charts/hooks/useChartData'
import { useTemperatureUnit } from '@/client/context/settings'

jest.mock('@/client/components/line-charts/line-chart-base', () => jest.fn(() => null))
jest.mock('@/client/components/line-charts/hooks/useChartData', () => ({
  useChartData: jest.fn(),
}))
jest.mock('@/client/context/settings', () => ({
  useTemperatureUnit: jest.fn(),
}))

const mockedLineChart = LineChartBase as jest.MockedFunction<typeof LineChartBase>
const mockedUseChartData = useChartData as jest.MockedFunction<typeof useChartData>
const mockedUseTemperatureUnit = useTemperatureUnit as jest.MockedFunction<typeof useTemperatureUnit>

const renderChart = () =>
  render(
    <LanguageContext.Provider value='en'>
      <TemperatureChart id='ups' ambientTemperature={20} batteryTemperature={25} updated={new Date()} />
    </LanguageContext.Provider>
  )

describe('TemperatureChart', () => {
  beforeEach(() => {
    mockedLineChart.mockClear()
    mockedUseChartData.mockReset()
    mockedUseTemperatureUnit.mockReset().mockReturnValue('celsius')
  })

  it('renders temperature chart configuration', () => {
    mockedUseChartData
      .mockReturnValueOnce([{ dataPoint: 20, time: new Date('2024-01-01T00:00:00Z') }])
      .mockReturnValueOnce([{ dataPoint: 25, time: new Date('2024-01-01T00:00:00Z') }])

    renderChart()

    expect(mockedLineChart).toHaveBeenCalled()
    const props = mockedLineChart.mock.calls[0][0] as { id: string }
    expect(props.id).toBe('temperature-chart')
  })

  it('converts temperatures to fahrenheit when setting enabled', () => {
    mockedUseTemperatureUnit.mockReturnValue('fahrenheit')
    mockedUseChartData
      .mockReturnValueOnce([{ dataPoint: 25, time: new Date('2024-01-01T00:00:00Z') }])
      .mockReturnValueOnce([{ dataPoint: 30, time: new Date('2024-01-01T00:00:00Z') }])

    renderChart()

    const lastCall = mockedLineChart.mock.calls[mockedLineChart.mock.calls.length - 1]
    if (!lastCall) {
      throw new Error('LineChartBase was not called')
    }
    const props = lastCall[0] as {
      unit: string
      data: Array<{ ambientTemperature?: number; batteryTemperature?: number }>
    }

    expect(props.unit).toBe('°F')
    expect(props.data[0]?.ambientTemperature).toBeCloseTo(77)
    expect(props.data[0]?.batteryTemperature).toBeCloseTo(86)
  })
})
