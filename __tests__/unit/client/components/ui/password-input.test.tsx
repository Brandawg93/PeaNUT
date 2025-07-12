import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import PasswordInput from '@/client/components/ui/password-input'

describe('PasswordInput Component', () => {
  it('renders password input with toggle button', () => {
    render(<PasswordInput data-testid='password' />)

    expect(screen.getByTestId('password')).toBeInTheDocument()
    expect(screen.getByTestId('toggle-password')).toBeInTheDocument()
  })

  it('toggles password visibility when clicking the eye icon', () => {
    render(<PasswordInput data-testid='password' />)

    const passwordInput = screen.getByTestId('password')
    const toggleButton = screen.getByTestId('toggle-password')

    // Initially password should be hidden
    expect(passwordInput).toHaveAttribute('type', 'password')

    // Click to show password
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'text')

    // Click to hide password again
    fireEvent.click(toggleButton)
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('accepts custom data-testid props', () => {
    render(<PasswordInput dataTestId='custom-password' buttonTestId='custom-toggle' />)

    expect(screen.getByTestId('custom-password')).toBeInTheDocument()
    expect(screen.getByTestId('custom-toggle')).toBeInTheDocument()
  })

  it('passes through other props to the input element', () => {
    render(<PasswordInput placeholder='Enter password' required />)

    const passwordInput = screen.getByTestId('password')
    expect(passwordInput).toHaveAttribute('placeholder', 'Enter password')
    expect(passwordInput).toHaveAttribute('required')
  })
})
