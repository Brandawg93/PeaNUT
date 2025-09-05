import React, { Suspense } from 'react'
import logo from '@/app/icon.svg'
import LoginForm from '@/client/components/login-form'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div
        className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'
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
