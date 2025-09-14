import React from 'react'
import { screen, fireEvent, waitFor, act } from '@testing-library/react'
import { renderWithProviders } from '../../../utils/test-utils'
import ConfirmButton from '@/client/components/confirm-button'
import { PowerIcon } from 'lucide-react'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid='check-icon'>Check</div>,
  PowerIcon: () => <div data-testid='power-icon'>Power</div>,
}))

describe('ConfirmButton', () => {
  const defaultProps = {
    defaultLabel: 'Default Action',
    confirmLabel: 'Confirm',
    defaultIcon: <PowerIcon />,
    onConfirm: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('should render with default state', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} />)

    expect(screen.getByText('Default Action')).toBeInTheDocument()
    expect(screen.getByTestId('power-icon')).toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('should show confirm state when clicked', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByText('Confirm')).toBeInTheDocument()
    expect(screen.getByTestId('check-icon')).toBeInTheDocument()
    expect(screen.queryByText('Default Action')).not.toBeInTheDocument()
  })

  it('should execute onConfirm when clicked in armed state', async () => {
    const mockOnConfirm = jest.fn().mockResolvedValue(undefined)
    const mockOnSuccess = jest.fn()

    renderWithProviders(<ConfirmButton {...defaultProps} onConfirm={mockOnConfirm} onSuccess={mockOnSuccess} />)

    const button = screen.getByRole('button')

    // First click to arm
    fireEvent.click(button)
    expect(mockOnConfirm).not.toHaveBeenCalled()

    // Second click to confirm
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })

  it('should auto-revert after timeout', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} timeoutMs={3000} />)

    const button = screen.getByRole('button')

    // Click to arm
    fireEvent.click(button)
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(screen.getByText('Default Action')).toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('should use custom timeout duration', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} timeoutMs={1000} />)

    const button = screen.getByRole('button')

    // Click to arm
    fireEvent.click(button)
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    // Fast-forward time by less than timeout
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    // Fast-forward to timeout
    act(() => {
      jest.advanceTimersByTime(500)
    })
    expect(screen.getByText('Default Action')).toBeInTheDocument()
  })

  it('should be disabled when disabled prop is true', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} disabled />)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()

    fireEvent.click(button)
    expect(screen.getByText('Default Action')).toBeInTheDocument()
    expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
  })

  it('should use custom confirm icon when provided', () => {
    const customConfirmIcon = <div data-testid='custom-confirm'>Custom</div>

    renderWithProviders(<ConfirmButton {...defaultProps} confirmIcon={customConfirmIcon} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(screen.getByTestId('custom-confirm')).toBeInTheDocument()
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })

  it('should apply custom variant', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} variant='destructive' />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('should apply custom className', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} className='custom-class' />)

    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('should pass through data-testid', () => {
    renderWithProviders(<ConfirmButton {...defaultProps} data-testid='test-button' />)

    expect(screen.getByTestId('test-button')).toBeInTheDocument()
  })

  it('should handle async onConfirm properly', async () => {
    const mockOnConfirm = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    renderWithProviders(<ConfirmButton {...defaultProps} onConfirm={mockOnConfirm} />)

    const button = screen.getByRole('button')

    // First click to arm
    fireEvent.click(button)
    expect(screen.getByText('Confirm')).toBeInTheDocument()

    // Second click to confirm
    fireEvent.click(button)

    // Button should be disabled during execution
    expect(button).toBeDisabled()

    // Fast-forward async operation
    jest.advanceTimersByTime(100)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
      expect(button).not.toBeDisabled()
    })
  })

  it('should reset to default state after successful execution', async () => {
    const mockOnConfirm = jest.fn().mockResolvedValue(undefined)

    renderWithProviders(<ConfirmButton {...defaultProps} onConfirm={mockOnConfirm} />)

    const button = screen.getByRole('button')

    // Arm and confirm
    fireEvent.click(button)
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText('Default Action')).toBeInTheDocument()
      expect(screen.queryByText('Confirm')).not.toBeInTheDocument()
    })
  })

  it('should not execute onConfirm when already running', async () => {
    const mockOnConfirm = jest.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)))

    renderWithProviders(<ConfirmButton {...defaultProps} onConfirm={mockOnConfirm} />)

    const button = screen.getByRole('button')

    // Arm and start execution
    fireEvent.click(button)
    fireEvent.click(button)

    // Try to click again while running
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockOnConfirm).toHaveBeenCalledTimes(1)
    })
  })

  it('should clear timeout when component unmounts', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')
    const { unmount } = renderWithProviders(<ConfirmButton {...defaultProps} />)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})
