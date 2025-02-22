import React from 'react'
import { render, screen } from '@testing-library/react'
import NavBarControls from '@/client/components/navbar-controls'

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
      <NavBarControls
        devices={devices}
        onRefreshClick={() => {}}
        onRefetch={() => {}}
        onDeviceChange={() => {}}
        onLogout={() => {}}
        disableRefresh={false}
      />
    )

    const langSwitcher = screen.getByTitle('sidebar.language')

    expect(langSwitcher).toBeInTheDocument()
  })
})
