import React from 'react'
import Image from 'next/image'
import logo from '@/app/icon.svg'
import { useNavigation } from '@/hooks/useNavigation'

export default function NavBar({
  children, // will be a page or nested layout
}: {
  readonly children?: React.ReactNode
}) {
  const { push } = useNavigation()

  return (
    <div className='flex justify-center'>
      <div className='container mt-2'>
        <div className='border-border bg-card sticky top-0 z-10 mb-4 max-w-full rounded-lg border px-4 py-2 lg:px-8 lg:py-4'>
          <div className='flex flex-wrap items-center justify-between'>
            <button
              onClick={() => push('/')}
              className='flex cursor-pointer border-none bg-transparent py-1.5 text-xl font-medium no-underline'
            >
              <Image alt='' src={logo} width='30' height='30' className='h-[30px]' />
              &nbsp;PeaNUT
            </button>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
