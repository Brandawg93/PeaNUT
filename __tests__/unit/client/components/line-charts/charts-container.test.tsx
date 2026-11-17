import React from 'react'
import { render, screen } from '@testing-library/react'
import ChartsContainer from '@/client/components/line-charts/charts-container'
import WattsChart from '@/client/components/line-charts/watts-chart'
import { device, threePhaseVars } from '../../../../__mocks__/chartData'

jest.mock('@/client/components/line-charts/watts-chart', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid='watts-chart' />),
}))

describe('ChartsContainer wattage fallbacks', () => {
  const data = { device, updated: new Date() }

  it('charts total phase watts with the output nominal rating and updates to zero', () => {
    const { rerender } = render(<ChartsContainer vars={threePhaseVars} data={data} name={device.name} />)
    expect(screen.getByTestId('watts-chart')).toBeInTheDocument()
    expect(jest.mocked(WattsChart).mock.calls.at(-1)?.[0]).toMatchObject({
      realpower: 16600,
      realpowerNominal: 180000,
    })

    rerender(
      <ChartsContainer
        vars={{ ...threePhaseVars, 'output.realpower': { value: 0 } }}
        data={{ ...data, updated: new Date() }}
        name={device.name}
      />
    )
    expect(jest.mocked(WattsChart).mock.calls.at(-1)?.[0]).toMatchObject({ realpower: 0 })
  })

  it('does not chart estimated watts when phase power readings are incomplete', () => {
    const vars = { ...threePhaseVars }
    delete vars['output.L2.realpower']
    render(<ChartsContainer vars={vars} data={data} name={device.name} />)
    expect(screen.queryByTestId('watts-chart')).not.toBeInTheDocument()
  })
})
