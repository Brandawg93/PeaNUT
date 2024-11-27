import React from 'react'
import { render, fireEvent, waitFor } from '@testing-library/react'
import AddServer from '@/client/components/add-server'
import { LanguageContext } from '@/client/context/language'

describe('AddServer Component', () => {
  const mockHandleChange = jest.fn()
  const mockHandleRemove = jest.fn()
  const mockTestConnectionAction = jest.fn()

  const renderComponent = (removable = false) => {
    return render(
      <LanguageContext.Provider value='en'>
        <AddServer
          initialServer='localhost'
          initialPort={8080}
          initialUsername='admin'
          initialPassword='nut_test'
          handleChange={mockHandleChange}
          handleRemove={mockHandleRemove}
          testConnectionAction={mockTestConnectionAction}
          removable={removable}
        />
      </LanguageContext.Provider>
    )
  }

  test('renders without crashing', () => {
    const { getByTestId } = renderComponent()
    expect(getByTestId('server')).toBeInTheDocument()
    expect(getByTestId('port')).toBeInTheDocument()
  })

  test('calls setServer on server input change', () => {
    const { getByTestId } = renderComponent()
    const serverInput = getByTestId('server')
    fireEvent.change(serverInput, { target: { value: 'new-server' } })
    expect(mockHandleChange).toHaveBeenCalledWith('new-server', 8080, 'admin', 'nut_test')
  })

  test('calls setPort on port input change', () => {
    const { getByTestId } = renderComponent()
    const portInput = getByTestId('port')
    fireEvent.change(portInput, { target: { value: '9090' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 9090, 'admin', 'nut_test')
  })

  test('renders remove button when removable is true', () => {
    const { getByTitle } = renderComponent(true)
    const removeButton = getByTitle('settings.remove')
    expect(removeButton).toBeInTheDocument()
  })

  test('calls handleRemove on remove button click', () => {
    const { getByTitle } = renderComponent(true)
    const removeButton = getByTitle('settings.remove')
    fireEvent.click(removeButton)
    expect(mockHandleRemove).toHaveBeenCalled()
  })

  test('calls setUsername on username input change', () => {
    const { getByTestId } = renderComponent()
    const usernameInput = getByTestId('username')
    fireEvent.change(usernameInput, { target: { value: 'new-user' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 8080, 'new-user', 'nut_test')
  })

  test('calls setPassword on password input change', () => {
    const { getByTestId } = renderComponent()
    const passwordInput = getByTestId('password')
    fireEvent.change(passwordInput, { target: { value: 'new-password' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 8080, 'admin', 'new-password')
  })

  test('toggles password visibility', () => {
    const { getByTestId } = renderComponent()
    const toggleButton = getByTestId('toggle-password')
    const passwordInput = getByTestId('password')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click again to hide password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('calls testConnectionAction on test connection button click', async () => {
    mockTestConnectionAction.mockResolvedValue('Success')
    const { getByText } = renderComponent()
    const testButton = getByText('connect.test')
    fireEvent.click(testButton)
    expect(mockTestConnectionAction).toHaveBeenCalledWith('localhost', 8080)

    expect(testButton).toBeDisabled()

    await waitFor(() => expect(testButton).not.toBeDisabled())
  })
})
