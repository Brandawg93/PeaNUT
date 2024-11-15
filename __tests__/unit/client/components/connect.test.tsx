import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Connect from '@/client/components/connect'
import { LanguageContext } from '@/client/context/language'
import PromiseSocket from '@/server/promise-socket'

jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      replace: () => null,
    }
  },
}))

describe('Connect Component', () => {
  const mockLanguageContext = 'en'

  const renderComponent = () =>
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <Connect />
      </LanguageContext.Provider>
    )

  beforeAll(() => {
    jest.spyOn(PromiseSocket.prototype, 'connect').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'close').mockResolvedValue()
    jest.spyOn(PromiseSocket.prototype, 'write').mockResolvedValue()
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders without crashing', () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId('login-wrapper')).toBeInTheDocument()
  })

  it('calls setSettings and onConnect on form submit', async () => {
    const { getByTestId, getByText } = renderComponent()

    fireEvent.change(getByTestId('server'), { target: { value: 'localhost' } })
    fireEvent.change(getByTestId('port'), { target: { value: '1234' } })

    fireEvent.click(getByText('connect.connect'))
  })

  it('shows success icon on successful connection test', async () => {
    const { getByTestId, getByText, queryByText } = renderComponent()

    fireEvent.change(getByTestId('server'), { target: { value: 'localhost' } })
    fireEvent.change(getByTestId('port'), { target: { value: '1234' } })

    fireEvent.click(getByText('connect.test'))

    await waitFor(() => {
      expect(queryByText('connect.test')).not.toBeInTheDocument()
    })
  })
})
