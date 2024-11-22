import React from 'react'
import { render, fireEvent } from '@testing-library/react'
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
    expect(mockHandleChange).toHaveBeenCalledWith('new-server', 8080)
  })

  test('calls setPort on port input change', () => {
    const { getByTestId } = renderComponent()
    const portInput = getByTestId('port')
    fireEvent.change(portInput, { target: { value: '9090' } })
    expect(mockHandleChange).toHaveBeenCalledWith('localhost', 9090)
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
})
