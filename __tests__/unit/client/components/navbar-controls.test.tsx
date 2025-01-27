import React from 'react'
import { render, screen } from '@testing-library/react'
import NavBarControls from '@/client/components/navbar-controls'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      replace: () => null,
    }
  },
}))

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
  it.skip('renders', () => {
    render(
      <NavBarControls
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
})
