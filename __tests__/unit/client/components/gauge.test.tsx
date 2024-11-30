import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Gauge, { gaugeChartText } from '@/client/components/gauge'

jest.mock('react-chartjs-2', () => ({
  Doughnut: () => null,
}))

describe('Gauge', () => {
  it('renders', () => {
    const { getByTestId } = render(<Gauge percentage={100} title='test' />)
    expect(getByTestId('gauge')).toBeInTheDocument()
  })

  it('handles onClick event', () => {
    const handleClick = jest.fn()
    const { getByTestId } = render(<Gauge percentage={75} title='Clickable Gauge' onClick={handleClick} />)
    fireEvent.click(getByTestId('gauge'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies correct styles when onClick is provided', () => {
    const { getByTestId } = render(<Gauge percentage={30} title='Styled Gauge' onClick={() => {}} />)
    expect(getByTestId('gauge')).toHaveStyle('cursor: pointer')
  })

  it('applies correct styles when onClick is not provided', () => {
    const { getByTestId } = render(<Gauge percentage={30} title='Non-Clickable Gauge' />)
    expect(getByTestId('gauge')).toHaveStyle('cursor: default')
  })

  it('draws the correct text on the canvas', async () => {
    const mockCtx = {
      save: jest.fn(),
      textAlign: '',
      textBaseline: '',
      font: '',
      fillText: jest.fn(),
    }
    const mockChart = {
      ctx: mockCtx,
      data: {
        datasets: [{ data: [75] }],
      },
      chartArea: { height: 200 },
      getDatasetMeta: () => ({
        data: [{ x: 100, y: 100 }],
      }),
    }

    gaugeChartText.afterDatasetsDraw(mockChart)

    expect(mockCtx.save).toHaveBeenCalled()
    expect(mockCtx.textAlign).toBe('center')
    expect(mockCtx.textBaseline).toBe('bottom')
    expect(mockCtx.font).toBe('50px sans-serif')
    expect(mockCtx.fillText).toHaveBeenCalledWith('75%', 100, 100)
  })
})
