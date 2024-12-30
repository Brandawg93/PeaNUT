import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import Gauge from '@/client/components/gauge'

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
})
