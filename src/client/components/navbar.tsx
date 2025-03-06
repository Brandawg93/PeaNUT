import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import logo from '@/app/icon.svg'

export default function NavBar({
  children, // will be a page or nested layout
}: {
  readonly children?: React.ReactNode
}) {
  return (
    <div className='flex justify-center'>
      <div className='container mt-2'>
        <div className='border-border bg-card sticky top-0 z-10 mb-4 h-max max-w-full rounded-lg border px-4 py-2 lg:px-8 lg:py-4'>
          <div className='flex flex-wrap justify-between'>
            <Link href='/' className='flex cursor-pointer py-1.5 text-xl font-medium no-underline'>
              <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
              &nbsp;PeaNUT
            </Link>
            <div>{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
