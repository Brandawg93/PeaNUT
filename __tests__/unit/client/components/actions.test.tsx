import React from 'react'
import { screen } from '@testing-library/react'
import Actions from '@/client/components/actions'
import { renderWithProviders } from '../../../utils/test-utils'

// sonner emits portals to document.body and uses ResizeObserver etc. Stub it.
jest.mock('sonner', () => ({
  Toaster: () => null,
  toast: { success: jest.fn(), error: jest.fn() },
}))

describe('Actions menu', () => {
  it('renders nothing when the device supports none of the known commands', () => {
    renderWithProviders(<Actions device='ups' commands={['some.unrelated.cmd']} runCommandAction={jest.fn()} />)
    // No buttons should be rendered when the menu suppresses itself.
    expect(screen.queryAllByRole('button')).toHaveLength(0)
  })

  it('renders the action trigger when a supported test command is present', () => {
    renderWithProviders(<Actions device='ups' commands={['test.battery.start.quick']} runCommandAction={jest.fn()} />)
    // The DropdownMenuTrigger is a button; we just need to confirm the component
    // mounted rather than collapsing to null.
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('renders when shutdown commands are supported', () => {
    renderWithProviders(
      <Actions device='ups' commands={['shutdown.return', 'shutdown.stayoff']} runCommandAction={jest.fn()} />
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('renders when beeper commands are supported and vars indicate enabled state', () => {
    renderWithProviders(
      <Actions
        device='ups'
        commands={['beeper.enable', 'beeper.disable', 'beeper.mute']}
        runCommandAction={jest.fn()}
        vars={{ 'ups.beeper.status': { value: 'enabled' } }}
      />
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('handles vars indicating beeper is disabled', () => {
    renderWithProviders(
      <Actions
        device='ups'
        commands={['beeper.enable', 'beeper.disable']}
        runCommandAction={jest.fn()}
        vars={{ 'beeper.status': { value: 'disabled' } }}
      />
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })

  it('renders when vars have no beeper signal', () => {
    renderWithProviders(
      <Actions
        device='ups'
        commands={['beeper.enable']}
        runCommandAction={jest.fn()}
        vars={{ 'battery.charge': { value: '100' } }}
      />
    )
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0)
  })
})
