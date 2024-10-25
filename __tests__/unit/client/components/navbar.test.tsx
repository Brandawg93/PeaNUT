import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import NavBar from '@/client/components/navbar'

const devices = [
  {
    vars: {},
    rwVars: [],
    commands: [],
    description: 'test',
    clients: [],
    name: 'test',
  },
  {
    vars: {},
    rwVars: [],
    commands: [],
    description: 'test2',
    clients: [],
    name: 'test2',
  },
]

describe('NavBar', () => {
  it('renders', () => {
    render(
      <NavBar
        devices={devices}
        onRefreshClick={() => {}}
        onRefetch={() => {}}
        onDeviceChange={() => {}}
        onDisconnect={() => {}}
        disableRefresh={false}
      />
    )

    const heading = screen.getByText('PeaNUT')

    expect(heading).toBeInTheDocument()
  })

  it('handles device selection', () => {
    render(
      <NavBar
        devices={devices}
        onRefreshClick={() => {}}
        onRefetch={() => {}}
        onDeviceChange={() => {}}
        onDisconnect={() => {}}
        disableRefresh={false}
      />
    )

    const select = screen.getByTestId('device-select-standard')
    fireEvent.change(select, { target: { value: 'test2' } })
  })
})
