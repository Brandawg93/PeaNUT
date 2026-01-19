import React, { Suspense } from 'react'
import logo from '@/app/icon.svg'
import LoginForm from '@/client/components/login-form'
import Image from 'next/image'

import { authStorage } from '@/server/auth-storage'
import { redirect } from 'next/navigation'

export default function LoginPage() {
  if (!authStorage.hasUser()) {
    redirect('/setup')
  }
  return (
    <main className='bg-background flex min-h-screen items-center justify-center p-4'>
      <div
        className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-4 md:-mt-32'
        data-testid='login-wrapper'
      >
        <div className='flex justify-center'>
          <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
        </div>
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  )
}
