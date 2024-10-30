'use client'

import 'react-toastify/dist/ReactToastify.css'
import React, { useContext, useEffect } from 'react'
import Image from 'next/image'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { Card, Input, Button } from '@material-tailwind/react'
import { getCurrentTheme } from '@/client/context/theme'

import { LanguageContext } from '@/client/context/language'
import logo from '@/app/icon.svg'
import { setSettings, testConnection } from '@/app/actions'

type Props = {
  onConnect: () => void
}

export default function Connect(props: Props) {
  const [server, setServer] = React.useState<string>('')
  const [port, setPort] = React.useState<number>(3493)
  const [connecting, setConnecting] = React.useState<boolean>(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const { onConnect } = props

  useEffect(() => {
    async function getLoader() {
      const { dotPulse } = await import('ldrs')
      dotPulse.register()
    }
    getLoader()
  }, [])

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setSettings('NUT_HOST', server)
    setSettings('NUT_PORT', port)
    onConnect()
  }

  const handleTestConnection = async () => {
    if (server && port) {
      setConnecting(true)
      const promise = testConnection(server, port)
      toast.promise(promise, {
        pending: t('connect.testing'),
        success: {
          render() {
            setConnecting(false)
            return t('connect.success')
          },
        },
        error: {
          render() {
            setConnecting(false)
            return t('connect.error')
          },
        },
      })
    }
  }

  const getTestButton = () => {
    if (connecting) {
      return (
        <div>
          <l-dot-pulse size={33} speed={1.3} color='white'></l-dot-pulse>
        </div>
      )
    } else {
      return <>{t('connect.test')}</>
    }
  }

  return (
    <div
      className='absolute left-0 top-0 flex h-full w-full flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 text-center dark:from-gray-900 dark:to-gray-800 dark:text-white'
      data-testid='wrapper'
    >
      <ToastContainer position='top-center' theme={getCurrentTheme()} />
      <div className='mb-8 flex justify-center'>
        <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
      </div>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>PeaNUT</h1>
      </div>
      <Card className='border-neutral-300 relative flex flex-row justify-around border border-solid border-gray-300 shadow-md dark:border-gray-800 dark:bg-gray-950'>
        <form className='w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-800' onSubmit={handleSubmit}>
          <div className='mb-4'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.server')}
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className='w-full px-3 py-2'
              color={getCurrentTheme() === 'light' ? 'black' : 'white'}
              id='server'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='number'
              variant='outlined'
              label={t('connect.port')}
              value={port}
              onChange={(e) => setPort(+e.target.value)}
              className='w-full px-3 py-2'
              color={getCurrentTheme() === 'light' ? 'black' : 'white'}
              id='port'
              min={0}
              max={65535}
              crossOrigin=''
            />
          </div>
          <div className='flex flex-row items-center justify-between'>
            <Button
              disabled={connecting}
              onClick={handleTestConnection}
              className='bg-red-500 px-4 py-2 font-bold text-white hover:bg-red-700'
              type='button'
            >
              {getTestButton()}
            </Button>
            <Button
              disabled={connecting}
              className='bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700'
              type='submit'
            >
              {t('connect.connect')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
