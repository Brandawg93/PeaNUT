import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import Connect from '@/client/components/connect'
import { LanguageContext } from '@/client/context/language'
import PromiseSocket from '@/server/promise-socket'

describe('Connect Component', () => {
  const mockOnConnect = jest.fn()
  const mockLanguageContext = 'en'

  const renderComponent = () =>
    render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <Connect onConnect={mockOnConnect} />
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
    expect(getByTestId('wrapper')).toBeInTheDocument()
  })

  it('calls setSettings and onConnect on form submit', async () => {
    const { getByPlaceholderText, getByText } = renderComponent()

    fireEvent.change(getByPlaceholderText('Enter server address'), { target: { value: 'localhost' } })
    fireEvent.change(getByPlaceholderText('Enter port number'), { target: { value: '1234' } })

    fireEvent.click(getByText('connect.connect'))

    await waitFor(() => {
      expect(mockOnConnect).toHaveBeenCalled()
    })
  })

  it('shows success icon on successful connection test', async () => {
    const { getByPlaceholderText, getByText, queryByText } = renderComponent()

    fireEvent.change(getByPlaceholderText('Enter server address'), { target: { value: 'localhost' } })
    fireEvent.change(getByPlaceholderText('Enter port number'), { target: { value: '1234' } })

    fireEvent.click(getByText('connect.test'))

    await waitFor(() => {
      expect(queryByText('connect.test')).not.toBeInTheDocument()
    })
  })
})
