'use client'

import React, { useActionState, useState } from 'react'
import { HiArrowRight, HiOutlineExclamationCircle, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { Button } from '@/client/components/ui/button'
import { authenticate } from '@/app/actions'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/client/components/ui/card'
import { Label } from '@/client/components/ui/label'
import { Input } from '@/client/components/ui/input'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const toggleShowPassword = () => setShowPassword(!showPassword)

  return (
    <Card className='border-border bg-card p-6 shadow-none'>
      <form action={formAction} className='w-full'>
        <div className='mb-4'>
          <h1 className='mb-6 text-2xl'>Please log in to continue.</h1>
          <div className='mb-4'>
            <Label htmlFor='email'>Email</Label>
            <div className='flex'>
              <Input
                className='border-border-card bg-background z-10 px-3 py-2'
                id='email'
                type='email'
                name='email'
                placeholder='Enter your email address'
                required
              />
            </div>
          </div>
          <div className='mb-6'>
            <Label htmlFor='password'>Password</Label>
            <div className='flex'>
              <Input
                className='border-border-card bg-background z-10 rounded-r-none border-r-0 px-3 py-2 focus:rounded focus:border-r'
                id='password'
                type={showPassword ? 'text' : 'password'}
                name='password'
                placeholder='Enter password'
                required
                minLength={6}
              />
              <Button
                size='icon'
                data-testid='toggle-password'
                onClick={toggleShowPassword}
                className='border-border-card bg-background relative overflow-hidden rounded-l-none border border-l-0 p-0'
                variant='ghost'
                type='button'
              >
                <div className='text-muted-foreground'>
                  {showPassword ? (
                    <HiOutlineEyeSlash className='size-6 stroke-1' />
                  ) : (
                    <HiOutlineEye className='size-6 stroke-1' />
                  )}
                </div>
              </Button>
            </div>
          </div>
          <input type='hidden' name='redirectTo' value={callbackUrl} />
          <div className='flex flex-row justify-end'>
            <Button className='font-bold shadow-none' aria-disabled={isPending} data-testid='login-button'>
              Log in <HiArrowRight className='ml-2 h-5 w-5' />
            </Button>
          </div>
          <div className='flex h-8 items-end space-x-1' aria-live='polite' aria-atomic='true'>
            {errorMessage && (
              <>
                <HiOutlineExclamationCircle className='h-5 w-5 text-red-500' />
                <p className='text-sm text-red-500'>{errorMessage}</p>
              </>
            )}
          </div>
        </div>
      </form>
    </Card>
  )
}
