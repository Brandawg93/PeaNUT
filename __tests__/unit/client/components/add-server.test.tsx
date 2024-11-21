import React from 'react'
import { render, fireEvent } from '@testing-library/react'
import AddServer from '@/client/components/add-server'
import { LanguageContext } from '@/client/context/language'

describe('AddServer Component', () => {
  const mockSetServer = jest.fn()
  const mockSetPort = jest.fn()
  const mockHandleSubmit = jest.fn((e) => e.preventDefault())
  const mockHandleRemove = jest.fn()

  const renderComponent = (removable = false) => {
    return render(
      <LanguageContext.Provider value='en'>
        <AddServer
          server='localhost'
          port={8080}
          setServer={mockSetServer}
          setPort={mockSetPort}
          handleSubmit={mockHandleSubmit}
          handleRemove={mockHandleRemove}
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
    expect(mockSetServer).toHaveBeenCalledWith('new-server')
  })

  test('calls setPort on port input change', () => {
    const { getByTestId } = renderComponent()
    const portInput = getByTestId('port')
    fireEvent.change(portInput, { target: { value: '9090' } })
    expect(mockSetPort).toHaveBeenCalledWith(9090)
  })

  test('calls handleSubmit on form submit', () => {
    const { getByTestId } = renderComponent()
    const form = getByTestId('server').closest('form')
    if (form) {
      fireEvent.submit(form)
    }
    expect(mockHandleSubmit).toHaveBeenCalled()
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
