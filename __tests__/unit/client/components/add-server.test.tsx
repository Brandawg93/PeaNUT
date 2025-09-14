import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import AddServer from '@/client/components/add-server'
import { LanguageContext } from '@/client/context/language'

describe('AddServer', () => {
  const renderComponent = (props?: Partial<React.ComponentProps<typeof AddServer>>) =>
    render(
      <LanguageContext.Provider value='en'>
        <AddServer
          initialServer={props?.initialServer ?? 'localhost'}
          initialPort={props?.initialPort ?? 3493}
          initialUsername={props?.initialUsername}
          initialPassword={props?.initialPassword}
          initialDisabled={props?.initialDisabled}
          handleChange={props?.handleChange ?? jest.fn()}
          handleRemove={props?.handleRemove ?? jest.fn()}
          testConnectionAction={props?.testConnectionAction ?? jest.fn().mockResolvedValue('success')}
          saved={props?.saved}
        />
      </LanguageContext.Provider>
    )

  it('shows options trigger and disables inputs when disabled', () => {
    renderComponent({ initialDisabled: true })
    expect(screen.getByLabelText('options')).toBeInTheDocument()
    expect(screen.getByTestId('server')).toBeDisabled()
    expect(screen.getByTestId('port')).toBeDisabled()
  })

  // Dropdown interactions are covered in E2E; unit test focuses on disabled state and handlers
})

describe('AddServer Component', () => {
  const mockHandleChange = jest.fn()
  const mockHandleRemove = jest.fn()
  const mockTestConnectionAction = jest.fn()

  const renderComponent = () => {
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
    expect(mockHandleChange).toHaveBeenCalledWith('new-server', 8080, 'admin', 'nut_test', false)
  })

  test('calls setPort on port input change', () => {
    const { getByTestId } = renderComponent()
    const portInput = getByTestId('port')
    fireEvent.change(portInput, { target: { value: '9090' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 9090, 'admin', 'nut_test', false)
  })

  test('calls handleRemove on remove button click', () => {
    const { getByTitle } = renderComponent()
    const removeButton = getByTitle('settings.remove')
    fireEvent.click(removeButton)
    expect(mockHandleRemove).toHaveBeenCalled()
  })

  test('calls setUsername on username input change', () => {
    const { getByTestId } = renderComponent()
    const usernameInput = getByTestId('username')
    fireEvent.change(usernameInput, { target: { value: 'new-user' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 8080, 'new-user', 'nut_test', false)
  })

  test('calls setPassword on password input change', () => {
    const { getByTestId } = renderComponent()
    const passwordInput = getByTestId('password')
    fireEvent.change(passwordInput, { target: { value: 'new-password' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 8080, 'admin', 'new-password', false)
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

  test.skip('calls testConnectionAction when selecting menu item', async () => {
    mockTestConnectionAction.mockResolvedValue('Success')
    const { getByLabelText, findByTestId } = renderComponent()
    fireEvent.click(getByLabelText('options'))
    const testItem = await findByTestId('menu-test')
    fireEvent.click(testItem)
    expect(mockTestConnectionAction).toHaveBeenCalledWith('localhost', 8080, 'admin', 'nut_test')
  })
})
