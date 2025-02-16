import React, { render, screen, fireEvent } from '@testing-library/react'
import LoginForm from '@/client/components/login-form'
import { useSearchParams } from 'next/navigation'
import { useActionState } from 'react'

// Mock the useActionState hook
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useActionState: jest.fn(),
  useState: jest.requireActual('react').useState,
}))

describe('LoginForm', () => {
  const mockSearchParams = new URLSearchParams()
  const mockFormAction = jest.fn()

  beforeEach(() => {
    // Setup default mocks
    ;(useSearchParams as jest.Mock).mockReturnValue(mockSearchParams)
    ;(useActionState as jest.Mock).mockReturnValue([undefined, mockFormAction, false])
  })

  it('renders the login form with all required elements', () => {
    render(<LoginForm />)

    expect(screen.getByText('Please log in to continue.')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByTestId('login-button')).toBeInTheDocument()
  })

  it('toggles password visibility when clicking the eye icon', () => {
    render(<LoginForm />)

    const passwordInput = screen.getByLabelText('Password')
    const toggleButton = screen.getByTestId('toggle-password')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click toggle button
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click toggle button again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('displays error message when authentication fails', () => {
    const errorMessage = 'Invalid credentials'
    ;(useActionState as jest.Mock).mockReturnValue([errorMessage, mockFormAction, false])

    render(<LoginForm />)

    expect(screen.getByText(errorMessage)).toBeInTheDocument()
  })

  it('uses default callback URL when none is provided', () => {
    render(<LoginForm />)

    const hiddenInput = screen.getByDisplayValue('/')
    expect(hiddenInput).toHaveAttribute('name', 'redirectTo')
  })

  it('uses provided callback URL from search params', () => {
    const callbackUrl = '/dashboard'
    const mockParamsWithCallback = new URLSearchParams()
    mockParamsWithCallback.set('callbackUrl', callbackUrl)
    ;(useSearchParams as jest.Mock).mockReturnValue(mockParamsWithCallback)

    render(<LoginForm />)

    const hiddenInput = screen.getByDisplayValue(callbackUrl)
    expect(hiddenInput).toHaveAttribute('name', 'redirectTo')
  })

  it('shows loading state when form submission is pending', () => {
    ;(useActionState as jest.Mock).mockReturnValue([undefined, mockFormAction, true])

    render(<LoginForm />)

    const loginButton = screen.getByTestId('login-button')
    expect(loginButton).toHaveAttribute('aria-disabled', 'true')
  })
})
