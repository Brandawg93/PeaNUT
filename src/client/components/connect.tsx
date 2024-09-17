'use client'

import React from 'react'
import Image from 'next/image'

import logo from '@/app/icon.svg'
import { setSettings } from '@/app/actions'

type Props = {
  onConnect: () => void
}

export default function Connect(props: Props) {
  const [server, setServer] = React.useState<string | undefined>()
  const [port, setPort] = React.useState<number | undefined>()

  const { onConnect } = props

  const handleSubmit = async () => {
    setSettings('NUT_HOST', server)
    setSettings('NUT_PORT', port)
    onConnect()
  }

  return (
    <div
      className='absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
      data-testid='wrapper'
    >
      <div className='mb-8 flex justify-center'>
        <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
      </div>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>PeaNUT</h1>
      </div>
      <div>
        <form className='w-full max-w-sm rounded-lg bg-white p-6 shadow-md dark:bg-gray-800'>
          <div className='mb-4'>
            <label className='mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300' htmlFor='server'>
              Server Address
            </label>
            <input
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
              id='server'
              type='text'
              placeholder='Enter server address'
            />
          </div>
          <div className='mb-6'>
            <label className='mb-2 block text-sm font-bold text-gray-700 dark:text-gray-300' htmlFor='port'>
              Port
            </label>
            <input
              value={port}
              onChange={(e) => setPort(parseInt(e.target.value))}
              className='focus:shadow-outline w-full appearance-none rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none'
              id='port'
              type='number'
              placeholder='Enter port number'
            />
          </div>
          <div className='flex flex-row-reverse items-center justify-between'>
            <button
              onClick={handleSubmit}
              className='focus:shadow-outline rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none'
              type='button'
            >
              Connect
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
