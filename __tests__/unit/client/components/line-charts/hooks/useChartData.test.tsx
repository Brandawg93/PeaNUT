import React from 'react'
import { renderHook, waitFor, act, render } from '@testing-library/react'
import { useChartData } from '@/client/components/line-charts/hooks/useChartData'
import { SettingsContext } from '@/client/context/settings'
import { TimeRangeProvider, useTimeRange } from '@/client/context/time-range'
import * as actions from '@/app/actions'

jest.mock('@/app/actions', () => ({
  ...jest.requireActual('@/app/actions'),
  getSettings: jest.fn().mockResolvedValue(''),
  checkSettings: jest.fn(),
  getInfluxHistory: jest.fn(),
}))

const baseSettings = {
  INFLUX_HOST: '',
  INFLUX_TOKEN: '',
  INFLUX_ORG: '',
  INFLUX_BUCKET: '',
  INFLUX_INTERVAL: 10,
}

const wrapperFor = (settingsOverrides: Partial<typeof baseSettings> = {}) => {
  const value = {
    settings: { ...baseSettings, ...settingsOverrides },
    refreshSettings: () => {},
  }
  return function Wrapper({ children }: { readonly children: React.ReactNode }) {
    return (
      <SettingsContext.Provider value={value}>
        <TimeRangeProvider>{children}</TimeRangeProvider>
      </SettingsContext.Provider>
    )
  }
}

describe('useChartData', () => {
  const getInfluxHistoryMock = actions.getInfluxHistory as jest.Mock

  beforeEach(() => {
    getInfluxHistoryMock.mockReset()
    window.localStorage.clear()
  })

  it('falls back to a single current-value point when InfluxDB is not configured', async () => {
    // A stable `updated` reference, matching how a real caller only produces a new one
    // when a fresh poll actually arrives (not on every re-render).
    const updated = new Date()
    const { result } = renderHook(() => useChartData('ups', 'input.voltage', updated, 120), {
      wrapper: wrapperFor(),
    })

    await waitFor(() => expect(result.current).toHaveLength(1))
    expect(result.current[0].dataPoint).toBe(120)
    expect(getInfluxHistoryMock).not.toHaveBeenCalled()
  })

  it('appends new live values without querying InfluxDB when unconfigured', async () => {
    const { result, rerender } = renderHook(
      ({ updated, value }) => useChartData('ups', 'input.voltage', updated, value),
      {
        wrapper: wrapperFor(),
        initialProps: { updated: new Date(0), value: 120 },
      }
    )

    await waitFor(() => expect(result.current).toHaveLength(1))

    rerender({ updated: new Date(1), value: 121 })
    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current[1].dataPoint).toBe(121)
  })

  it('seeds from InfluxDB history when configured', async () => {
    getInfluxHistoryMock.mockResolvedValue([
      { time: '2023-01-01T00:00:00Z', value: 118 },
      { time: '2023-01-01T00:01:00Z', value: 119 },
    ])

    const updated = new Date()
    const { result } = renderHook(() => useChartData('ups', 'input.voltage', updated, 120), {
      wrapper: wrapperFor({
        INFLUX_HOST: 'http://localhost:8086',
        INFLUX_TOKEN: 't',
        INFLUX_ORG: 'o',
        INFLUX_BUCKET: 'b',
      }),
    })

    await waitFor(() => expect(result.current).toHaveLength(2))
    expect(result.current.map((p) => p.dataPoint)).toEqual([118, 119])
    expect(getInfluxHistoryMock).toHaveBeenCalledWith('ups', 'input.voltage', 0)
  })

  it('re-queries InfluxDB with the new range when the selected time range changes', async () => {
    getInfluxHistoryMock.mockResolvedValue([{ time: '2023-01-01T00:00:00Z', value: 118 }])

    const updated = new Date()
    function Harness() {
      const data = useChartData('ups', 'input.voltage', updated, 120)
      const { setTimeRange } = useTimeRange()
      return (
        <div>
          <span data-testid='count'>{data.length}</span>
          <button onClick={() => setTimeRange(60)}>set-range</button>
        </div>
      )
    }

    const { getByText, findByTestId } = render(<Harness />, {
      wrapper: wrapperFor({
        INFLUX_HOST: 'http://localhost:8086',
        INFLUX_TOKEN: 't',
        INFLUX_ORG: 'o',
        INFLUX_BUCKET: 'b',
      }),
    })

    await findByTestId('count')
    expect(getInfluxHistoryMock).toHaveBeenCalledWith('ups', 'input.voltage', 0)

    act(() => {
      getByText('set-range').click()
    })

    await waitFor(() => expect(getInfluxHistoryMock).toHaveBeenCalledWith('ups', 'input.voltage', 60))
  })
})
