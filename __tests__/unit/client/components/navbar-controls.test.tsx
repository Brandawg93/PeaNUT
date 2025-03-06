import React from 'react'
import { render, screen } from '@testing-library/react'
import NavBarControls from '@/client/components/navbar-controls'

describe('NavBar', () => {
  it('renders', () => {
    render(<NavBarControls onRefreshClick={() => {}} onRefetch={() => {}} onLogout={() => {}} disableRefresh={false} />)

    const langSwitcher = screen.getByTitle('sidebar.language')

    expect(langSwitcher).toBeInTheDocument()
  })
})
