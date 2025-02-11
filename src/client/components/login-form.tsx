'use client'

import React, { useActionState } from 'react'
import { HiArrowRight, HiOutlineAtSymbol, HiOutlineKey, HiOutlineExclamationCircle } from 'react-icons/hi2'
import { Button } from '@/client/components/ui/button'
import { authenticate } from '@/app/actions'
import { useSearchParams } from 'next/navigation'

export default function LoginForm() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') ?? '/'
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <form action={formAction} className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 pb-4 pt-8'>
        <h1 className='mb-3 text-2xl'>Please log in to continue.</h1>
        <div className='w-full'>
          <div>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='email'>
              Email
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='email'
                type='email'
                name='email'
                placeholder='Enter your email address'
                required
              />
              <HiOutlineAtSymbol className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
          <div className='mt-4'>
            <label className='mb-3 mt-5 block text-xs font-medium text-gray-900' htmlFor='password'>
              Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='password'
                type='password'
                name='password'
                placeholder='Enter password'
                required
                minLength={6}
              />
              <HiOutlineKey className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
          </div>
        </div>
        <input type='hidden' name='redirectTo' value={callbackUrl} />
        <Button className='mt-4 w-full' aria-disabled={isPending}>
          Log in <HiArrowRight className='ml-auto h-5 w-5 text-gray-50' />
        </Button>
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
  )
}
