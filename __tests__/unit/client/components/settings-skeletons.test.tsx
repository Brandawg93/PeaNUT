import React from 'react'
import { render } from '@testing-library/react'
import {
  ServersSkeleton,
  InfluxSkeleton,
  ConfigSkeleton,
  TerminalSkeleton,
  GeneralSkeleton,
  DashboardSkeleton,
} from '@/client/components/settings-skeletons'

describe('Settings Skeletons', () => {
  it('renders ServersSkeleton', () => {
    const { container } = render(<ServersSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders InfluxSkeleton', () => {
    const { container } = render(<InfluxSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders ConfigSkeleton', () => {
    const { container } = render(<ConfigSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders TerminalSkeleton', () => {
    const { container } = render(<TerminalSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders GeneralSkeleton', () => {
    const { container } = render(<GeneralSkeleton />)
    expect(container).toBeInTheDocument()
  })

  it('renders DashboardSkeleton', () => {
    const { container } = render(<DashboardSkeleton />)
    expect(container).toBeInTheDocument()
  })
})
