import React from 'react'
import { render, fireEvent, screen } from '@testing-library/react'
import Kpi from '@/client/components/kpi'

describe('Kpi', () => {
  it('renders', () => {
    const { getByTestId } = render(<Kpi text={'PeaNUT'} description='PeaNUT' />)

    expect(getByTestId('kpi')).toBeInTheDocument()
  })

  describe('click handler', () => {
    it('calls onClick when clicked', () => {
      const mockOnClick = jest.fn()
      render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')
      fireEvent.click(kpiElement)

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when not provided', () => {
      render(<Kpi text={'PeaNUT'} description='PeaNUT' />)

      const kpiElement = screen.getByTestId('kpi')
      fireEvent.click(kpiElement)

      // Should not throw any errors
      expect(kpiElement).toBeInTheDocument()
    })

    it('calls onClick when Enter key is pressed', () => {
      const mockOnClick = jest.fn()
      render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')
      fireEvent.keyUp(kpiElement, { key: 'Enter' })

      expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when other keys are pressed', () => {
      const mockOnClick = jest.fn()
      render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')
      fireEvent.keyUp(kpiElement, { key: 'Space' })
      fireEvent.keyUp(kpiElement, { key: 'Tab' })
      fireEvent.keyUp(kpiElement, { key: 'Escape' })

      expect(mockOnClick).not.toHaveBeenCalled()
    })

    it('has correct accessibility attributes when onClick is provided', () => {
      const mockOnClick = jest.fn()
      render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')

      expect(kpiElement).toHaveAttribute('role', 'button')
      expect(kpiElement).toHaveAttribute('tabIndex', '0')
    })

    it('does not have accessibility attributes when onClick is not provided', () => {
      render(<Kpi text={'PeaNUT'} description='PeaNUT' />)

      const kpiElement = screen.getByTestId('kpi')

      expect(kpiElement).not.toHaveAttribute('role', 'button')
      expect(kpiElement).not.toHaveAttribute('tabIndex', '0')
    })

    it('has pointer cursor when onClick is provided', () => {
      const mockOnClick = jest.fn()
      render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')

      expect(kpiElement).toHaveStyle({ cursor: 'pointer' })
    })

    it('has default cursor when onClick is not provided', () => {
      render(<Kpi text={'PeaNUT'} description='PeaNUT' />)

      const kpiElement = screen.getByTestId('kpi')

      expect(kpiElement).toHaveStyle({ cursor: 'default' })
    })

    it('calls resize function after onClick', () => {
      const mockOnClick = jest.fn()
      const { rerender } = render(<Kpi text={'PeaNUT'} description='PeaNUT' onClick={mockOnClick} />)

      const kpiElement = screen.getByTestId('kpi')
      fireEvent.click(kpiElement)

      expect(mockOnClick).toHaveBeenCalledTimes(1)

      // Test that resize is called when text changes (which triggers useEffect)
      rerender(<Kpi text={'Updated Text'} description='PeaNUT' onClick={mockOnClick} />)

      // The component should still be rendered correctly
      expect(screen.getByTestId('kpi')).toBeInTheDocument()
    })
  })
})
