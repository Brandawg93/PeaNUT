import React, { ComponentProps } from 'react'
import { act, render } from '@testing-library/react'
import TemperatureChart from '@/client/components/line-charts/temperature-chart'
import ChartsContainer from '@/client/components/line-charts/charts-container'
import LineChartBase from '@/client/components/line-charts/line-chart-base'
import { useTemperatureUnit } from '@/client/context/settings'
import { useTimeRange } from '@/client/context/time-range'
import { device } from '../../../../__mocks__/chartData'
import { Nut } from '@/server/nut'
import PromiseSocket from '@/server/promise-socket'

jest.mock('@/client/components/line-charts/line-chart-base', () => jest.fn(() => null))
jest.mock('@/client/context/settings', () => ({ useTemperatureUnit: jest.fn() }))
jest.mock('@/client/context/time-range', () => ({ useTimeRange: jest.fn() }))

const mockedLineChart = jest.mocked(LineChartBase)
const mockedUseTemperatureUnit = jest.mocked(useTemperatureUnit)
const mockedUseTimeRange = jest.mocked(useTimeRange)
const updated = new Date('2026-01-01T00:00:00Z')

const chartProps = () => {
  const call = mockedLineChart.mock.calls.at(-1)
  if (!call) throw new Error('LineChartBase was not called')
  return call[0]
}

const renderChart = async (props: Partial<ComponentProps<typeof TemperatureChart>> = {}) => {
  let view!: ReturnType<typeof render>
  await act(async () => {
    view = render(<TemperatureChart id='ups' updated={updated} {...props} />)
  })
  return view
}

describe('TemperatureChart', () => {
  beforeEach(() => {
    mockedLineChart.mockClear()
    mockedUseTemperatureUnit.mockReturnValue('celsius')
    mockedUseTimeRange.mockReturnValue({ timeRange: 0, setTimeRange: jest.fn() })
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('charts the issue 445 UPS without an unavailable ambient or missing battery series', async () => {
    const vars = Object.freeze({
      'ambient.temperature': Object.freeze({ value: '-1' }),
      'ups.temperature': Object.freeze({ value: '32.5' }),
    })
    await act(async () => {
      render(<ChartsContainer vars={vars} data={{ device, updated }} name={device.name} />)
    })

    expect(chartProps()).toMatchObject({
      id: 'temperature-chart',
      unit: '°C',
      config: {
        upsTemperature: { label: 'temperatureChart.upsTemperature', color: 'var(--chart-3)' },
      },
      data: [{ upsTemperature: 32.5 }],
    })
    expect(Object.keys(chartProps().config)).toEqual(['time', 'upsTemperature'])
    expect(Object.keys(chartProps().data[0])).toEqual(['time', 'upsTemperature'])
    expect(vars['ambient.temperature'].value).toBe('-1')
  })

  it.each([undefined, -1, '-1', '', ' ', 'N/A', 'NaN', 'Infinity', NaN, Infinity])(
    'omits a chart with only unavailable readings (%p)',
    async (value) => {
      await renderChart({ ambientTemperature: value, batteryTemperature: value, upsTemperature: value })
      expect(mockedLineChart).not.toHaveBeenCalled()
    }
  )

  it('preserves zero and other subzero temperatures', async () => {
    await renderChart({ ambientTemperature: '0', batteryTemperature: -5, upsTemperature: 25 })
    expect(chartProps().data[0]).toMatchObject({ ambientTemperature: 0, batteryTemperature: -5, upsTemperature: 25 })
    expect(Object.keys(chartProps().config)).toEqual([
      'time',
      'ambientTemperature',
      'batteryTemperature',
      'upsTemperature',
    ])
  })

  it('preserves history when entire polls omit temperature variables', async () => {
    let view!: ReturnType<typeof render>
    const renderPoll = async (vars: ComponentProps<typeof ChartsContainer>['vars']) => {
      await act(async () => {
        const chart = <ChartsContainer vars={vars} data={{ device, updated: new Date() }} name={device.name} />
        if (view) view.rerender(chart)
        else view = render(chart)
      })
    }

    await renderPoll({})
    expect(mockedLineChart).not.toHaveBeenCalled()
    await renderPoll({ 'ups.temperature': { value: 20 } })
    await renderPoll({})
    await renderPoll({})
    await renderPoll({ 'ups.temperature': { value: 21 } })

    expect(chartProps().data.map((point) => point.upsTemperature)).toEqual([undefined, 20, undefined, undefined, 21])
    expect(chartProps().showDots).toBe(true)
  })

  it.each(['', '   ', '\t'])(
    'preserves blank NUMBER temperatures (%p) from NUT through the chart while retaining real zeroes',
    async (blank) => {
      jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
      jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
      jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
      jest.spyOn(PromiseSocket.prototype, 'readAll').mockImplementation(async (command) => {
        const [, , name, variable] = command.split(' ')
        if (command.startsWith('GET TYPE')) return `TYPE ${name} ${variable} NUMBER\n`
        if (command.startsWith('GET DESC')) return `DESC ${name} ${variable} "Temperature"\n`
        return `BEGIN LIST VAR ups\nVAR ups ambient.temperature "${blank}"\nVAR ups battery.temperature "0"\nVAR ups ups.temperature "25"\nEND LIST VAR ups\n`
      })
      const vars = await new Nut('localhost', 3493).getData('ups')
      expect(vars['ambient.temperature'].value).toBe('')
      expect(vars['battery.temperature'].value).toBe(0)

      await act(async () => {
        render(<ChartsContainer vars={vars} data={{ device, updated }} name={device.name} />)
      })

      expect(Object.keys(chartProps().config)).toEqual(['time', 'batteryTemperature', 'upsTemperature'])
      expect(chartProps().data[0]).toMatchObject({ batteryTemperature: 0, upsTemperature: 25 })
      expect(vars['ambient.temperature'].value).toBe('')
    }
  )

  it('converts every series to fahrenheit and toggles each legend independently', async () => {
    mockedUseTemperatureUnit.mockReturnValue('fahrenheit')
    await renderChart({ ambientTemperature: 25, batteryTemperature: 30, upsTemperature: 35 })
    expect(chartProps().unit).toBe('°F')
    expect(chartProps().data[0]).toMatchObject({ ambientTemperature: 77, batteryTemperature: 86, upsTemperature: 95 })

    for (const value of ['ambientTemperature', 'batteryTemperature', 'upsTemperature']) {
      const original = chartProps().data[0]
      await act(async () => chartProps().onLegendClick?.({ value }))
      expect(chartProps().data[0][value]).toBeUndefined()
      expect(chartProps().data).toHaveLength(1)
      await act(async () => chartProps().onLegendClick?.({ value }))
      expect(chartProps().data[0]).toEqual(original)
    }
  })

  it('keeps late, invalid, and recovered readings aligned with the other sensors', async () => {
    const view = await renderChart({ ambientTemperature: 20, upsTemperature: 30 })
    await act(async () => {
      view.rerender(
        <TemperatureChart
          id='ups'
          updated={new Date()}
          ambientTemperature={-1}
          batteryTemperature={25}
          upsTemperature={31}
        />
      )
    })
    await act(async () => {
      view.rerender(<TemperatureChart id='ups' updated={new Date()} ambientTemperature={21} upsTemperature={32} />)
    })

    expect(chartProps().data).toMatchObject([
      { ambientTemperature: 20, batteryTemperature: undefined, upsTemperature: 30 },
      { ambientTemperature: undefined, batteryTemperature: 25, upsTemperature: 31 },
      { ambientTemperature: 21, batteryTemperature: undefined, upsTemperature: 32 },
    ])
    expect(Object.keys(chartProps().data[0])).toContain('batteryTemperature')
  })

  it('starts a new history when switching devices', async () => {
    const view = await renderChart({ ambientTemperature: 20 })
    await act(async () => {
      view.rerender(<TemperatureChart id='other-ups' updated={updated} upsTemperature={35} />)
    })
    expect(chartProps().data).toHaveLength(1)
    expect(chartProps().data[0]).toMatchObject({ upsTemperature: 35 })
    expect(Object.keys(chartProps().config)).toEqual(['time', 'upsTemperature'])
  })

  it('filters all sensor histories to the selected time range', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask'] })
    jest.setSystemTime(updated)
    const view = await renderChart({ ambientTemperature: 20, upsTemperature: 30 })
    jest.setSystemTime(new Date(updated.getTime() + 120_000))
    mockedUseTimeRange.mockReturnValue({ timeRange: 1, setTimeRange: jest.fn() })
    await act(async () => {
      view.rerender(<TemperatureChart id='ups' updated={new Date()} batteryTemperature={25} upsTemperature={31} />)
    })
    expect(chartProps().data).toHaveLength(1)
    expect(chartProps().data[0]).toMatchObject({ batteryTemperature: 25, upsTemperature: 31 })
    expect(chartProps().config).not.toHaveProperty('ambientTemperature')
  })
})
