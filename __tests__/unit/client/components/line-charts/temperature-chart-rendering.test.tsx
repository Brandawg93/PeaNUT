import React from 'react'
import { act, render, waitFor } from '@testing-library/react'
import TemperatureChart from '@/client/components/line-charts/temperature-chart'

jest.mock('@/client/context/settings', () => ({ useTemperatureUnit: () => 'celsius' }))
jest.mock('@/client/context/time-range', () => ({ useTimeRange: () => ({ timeRange: 0 }) }))

// Give the real chart a fixed layout and disable animation so its SVG can be inspected in jsdom.
jest.mock('recharts', () => {
  const recharts = jest.requireActual('recharts')
  return {
    ...recharts,
    ResponsiveContainer: ({ children }: { children: React.ReactElement }) =>
      React.cloneElement(children as React.ReactElement<{ width: number; height: number }>, {
        width: 600,
        height: 300,
      }),
    Line: (props: React.ComponentProps<typeof recharts.Line>) => <recharts.Line {...props} isAnimationActive={false} />,
  }
})

it('renders isolated temperature readings as visible dots without connecting across missing polls', async () => {
  let view!: ReturnType<typeof render>
  await act(async () => {
    view = render(<TemperatureChart id='ups' updated={new Date()} upsTemperature={20} />)
  })
  await act(async () => {
    view.rerender(<TemperatureChart id='ups' updated={new Date()} />)
  })
  await act(async () => {
    view.rerender(<TemperatureChart id='ups' updated={new Date()} upsTemperature={21} />)
  })

  await waitFor(() => {
    expect(view.container.querySelectorAll('circle.recharts-line-dot')).toHaveLength(2)
  })
  for (const curve of view.container.querySelectorAll('path.recharts-line-curve')) {
    expect(curve.getAttribute('d')).not.toMatch(/[LC]/)
  }
})
