import React from 'react'
import { render, screen } from '@testing-library/react'
import Page from '@/app/settings/page'
import { checkSettings, getSettings } from '@/app/actions'

jest.mock('../../../../src/app/actions', () => ({
  checkSettings: jest.fn(),
  getSettings: jest.fn(),
}))

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([{ name: '1.0.0' }]),
  })
) as jest.Mock

describe('Settings Page', () => {
  beforeEach(() => {
    ;(checkSettings as jest.Mock).mockResolvedValue(true)
  })

  it('renders a heading', async () => {
    ;(getSettings as jest.Mock).mockResolvedValueOnce([{ server: { HOST: 'localhost', PORT: 8080 }, saved: true }])
    render(<Page />)

    const wrapper = await screen.findByTestId('settings-wrapper')
    expect(wrapper).toBeInTheDocument()
  })
})
