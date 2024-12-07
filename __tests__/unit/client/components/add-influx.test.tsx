import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddInflux from '@/client/components/add-influx'
import { LanguageContext } from '@/client/context/language'
import { ToastContainer } from 'react-toastify'

const mockHandleChange = jest.fn()
const mockTestConnectionAction = jest.fn()
const mockHandleClear = jest.fn()

const initialValues = {
  server: 'http://localhost',
  token: 'test-token',
  org: 'test-org',
  bucket: 'test-bucket',
  interval: 10,
}

const renderComponent = (lng = 'en') => {
  return render(
    <LanguageContext.Provider value={lng}>
      <ToastContainer />
      <AddInflux
        initialValues={initialValues}
        handleChange={mockHandleChange}
        handleClear={mockHandleClear}
        testInfluxConnectionAction={mockTestConnectionAction}
      />
    </LanguageContext.Provider>
  )
}

describe('AddInflux Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('renders input fields with initial values', () => {
    renderComponent()

    expect(screen.getByTestId('server')).toHaveValue(initialValues.server)
    expect(screen.getByTestId('token')).toHaveValue(initialValues.token)
    expect(screen.getByTestId('org')).toHaveValue(initialValues.org)
    expect(screen.getByTestId('bucket')).toHaveValue(initialValues.bucket)
  })

  test('calls handleChange on input change', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('server'), { target: { value: 'http://new-server' } })
    expect(mockHandleChange).toHaveBeenCalledWith(
      'http://new-server',
      initialValues.token,
      initialValues.org,
      initialValues.bucket,
      initialValues.interval
    )

    fireEvent.change(screen.getByTestId('token'), { target: { value: 'new-token' } })
    expect(mockHandleChange).toHaveBeenCalledWith(
      'http://new-server',
      'new-token',
      initialValues.org,
      initialValues.bucket,
      initialValues.interval
    )

    fireEvent.change(screen.getByTestId('org'), { target: { value: 'new-org' } })
    expect(mockHandleChange).toHaveBeenCalledWith(
      'http://new-server',
      'new-token',
      'new-org',
      initialValues.bucket,
      initialValues.interval
    )

    fireEvent.change(screen.getByTestId('bucket'), { target: { value: 'new-bucket' } })
    expect(mockHandleChange).toHaveBeenCalledWith(
      'http://new-server',
      'new-token',
      'new-org',
      'new-bucket',
      initialValues.interval
    )
  })

  test('displays toast messages on test connection', async () => {
    mockTestConnectionAction.mockResolvedValue('Success')
    renderComponent()

    fireEvent.click(screen.getByText('connect.test'))

    await waitFor(() =>
      expect(mockTestConnectionAction).toHaveBeenCalledWith(
        initialValues.server,
        initialValues.token,
        initialValues.org,
        initialValues.bucket,
        initialValues.interval
      )
    )
    await waitFor(() => expect(screen.getByText('connect.success')).toBeInTheDocument())
  })

  test('displays error toast message on test connection failure', async () => {
    mockTestConnectionAction.mockRejectedValue(new Error('Connection failed'))
    renderComponent()

    fireEvent.click(screen.getByText('connect.test'))

    await waitFor(() =>
      expect(mockTestConnectionAction).toHaveBeenCalledWith(
        initialValues.server,
        initialValues.token,
        initialValues.org,
        initialValues.bucket,
        initialValues.interval
      )
    )
    await waitFor(() => expect(screen.getByText('connect.error')).toBeInTheDocument())
  })

  test('toggles password visibility', () => {
    renderComponent()

    const toggleButton = screen.getByTestId('show-password')
    const passwordInput = screen.getByTestId('token')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  test('disables test connection button while connecting', async () => {
    mockTestConnectionAction.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500)))
    renderComponent()

    const testButton = screen.getByText('connect.test')
    fireEvent.click(testButton)

    expect(testButton).toBeDisabled()

    await waitFor(() => expect(testButton).not.toBeDisabled())
  })

  test('does not call test connection action if server or token is empty', () => {
    renderComponent()

    fireEvent.change(screen.getByTestId('server'), { target: { value: '' } })
    fireEvent.click(screen.getByText('connect.test'))

    expect(mockTestConnectionAction).not.toHaveBeenCalled()

    fireEvent.change(screen.getByTestId('server'), { target: { value: initialValues.server } })
    fireEvent.change(screen.getByTestId('token'), { target: { value: '' } })
    fireEvent.click(screen.getByText('connect.test'))

    expect(mockTestConnectionAction).not.toHaveBeenCalled()
  })
})
