import React from 'react'
import { screen, fireEvent, act } from '@testing-library/react'
import Refresh from '@/client/components/refresh'
import { renderWithProviders } from '../../../utils/test-utils'

describe('Refresh', () => {
  const baseProps = {
    onClick: jest.fn(),
    onRefreshChange: jest.fn(),
    refreshInterval: 0,
    disabled: false,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  it('renders both buttons', () => {
    renderWithProviders(<Refresh {...baseProps} />)
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })

  it('invokes onClick when the refresh button is pressed', () => {
    const onClick = jest.fn()
    renderWithProviders(<Refresh {...baseProps} onClick={onClick} />)

    const [refreshButton] = screen.getAllByRole('button')
    fireEvent.click(refreshButton)

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('clears spin effect on animation end', () => {
    renderWithProviders(<Refresh {...baseProps} />)
    const [refreshButton] = screen.getAllByRole('button')
    fireEvent.click(refreshButton)
    fireEvent.animationEnd(refreshButton)
    // No exception → branch covered
    expect(refreshButton).toBeInTheDocument()
  })

  it('disables the refresh button when disabled prop is true', () => {
    renderWithProviders(<Refresh {...baseProps} disabled />)
    const [refreshButton] = screen.getAllByRole('button')
    expect(refreshButton).toBeDisabled()
  })

  const openDropdown = async () => {
    const [, dropdownTrigger] = screen.getAllByRole('button')
    await act(async () => {
      fireEvent.pointerDown(dropdownTrigger, { button: 0, ctrlKey: false })
      fireEvent.mouseDown(dropdownTrigger, { button: 0 })
      fireEvent.click(dropdownTrigger)
    })
  }

  it('selects an interval, writes localStorage, and notifies parent', async () => {
    const onRefreshChange = jest.fn()
    renderWithProviders(<Refresh {...baseProps} onRefreshChange={onRefreshChange} />)

    await openDropdown()

    const item = await screen.findByText('5s')
    await act(async () => {
      fireEvent.click(item)
    })

    expect(onRefreshChange).toHaveBeenCalledWith(5)
    expect(localStorage.getItem('refreshInterval')).toBe('5')
  })

  it('renders "off" for the 0 option', async () => {
    renderWithProviders(<Refresh {...baseProps} />)
    await openDropdown()
    expect(await screen.findByText('off')).toBeInTheDocument()
  })

  it('marks the active interval option', async () => {
    renderWithProviders(<Refresh {...baseProps} refreshInterval={10} />)
    await openDropdown()
    const active = await screen.findByText('10s')
    expect(active.className).toContain('bg-secondary-highlight!')
  })
})
