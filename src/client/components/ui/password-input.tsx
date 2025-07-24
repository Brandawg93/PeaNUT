import React, { useState } from 'react'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  dataTestId?: string
  buttonTestId?: string
}

export default function PasswordInput({
  dataTestId = 'password',
  buttonTestId = 'toggle-password',
  className = '',
  ...props
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const toggleShowPassword = () => setShowPassword(!showPassword)

  return (
    <div className='flex'>
      <Input
        type={showPassword ? 'text' : 'password'}
        className={`border-border-card bg-background! z-10 mt-1 rounded-r-none border-r-0 px-3 py-2 focus:rounded focus:border-r ${className}`}
        data-testid={dataTestId}
        {...props}
      />
      <Button
        size='icon'
        data-testid={buttonTestId}
        onClick={toggleShowPassword}
        className='border-border-card bg-background relative mt-1 cursor-pointer overflow-hidden rounded-l-none border border-l-0 p-0'
        variant='ghost'
        type='button'
      >
        <div className='text-muted-foreground'>
          {showPassword ? <HiOutlineEyeSlash className='stroke-1' /> : <HiOutlineEye className='stroke-1' />}
        </div>
      </Button>
    </div>
  )
}
