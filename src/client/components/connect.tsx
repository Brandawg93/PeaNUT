'use client'

import React, { useContext, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { ToastContainer, toast } from 'react-toastify'
import { Card } from '@/client/components/ui/card'
import { Input, Button } from '@material-tailwind/react'

import { LanguageContext } from '@/client/context/language'
import { useTheme } from 'next-themes'
import logo from '@/app/icon.svg'
import { server } from '@/common/types'

type ConnectProps = {
  testConnectionAction: (server: string, port: number) => Promise<string>
  updateServersAction: (servers: Array<server>) => Promise<void>
}

export default function Connect({ testConnectionAction, updateServersAction }: ConnectProps) {
  const [server, setServer] = React.useState<string>('')
  const [port, setPort] = React.useState<number>(3493)
  const [username, setUsername] = React.useState<string>('')
  const [password, setPassword] = React.useState<string>('')
  const [showPassword, setShowPassword] = React.useState<boolean>(false)
  const [connecting, setConnecting] = React.useState<boolean>(false)
  const lng = useContext<string>(LanguageContext)
  const { resolvedTheme } = useTheme()
  const { t } = useTranslation(lng)
  const router = useRouter()

  useEffect(() => {
    async function getLoader() {
      const { dotPulse } = await import('ldrs')
      dotPulse.register()
    }
    getLoader()
  }, [])

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    await updateServersAction([{ HOST: server, PORT: port, USERNAME: username, PASSWORD: password }])
    router.replace('/')
  }

  const handleTestConnection = async () => {
    if (server && port) {
      setConnecting(true)
      const promise = testConnectionAction(server, port)
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
      data-testid='login-wrapper'
    >
      <ToastContainer position='top-center' theme={resolvedTheme} />
      <div className='mb-8 flex justify-center'>
        <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
      </div>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>PeaNUT</h1>
      </div>
      <Card className='relative flex flex-row justify-around border border-border-card shadow-md'>
        <form className='w-full max-w-sm rounded-lg bg-white p-6 dark:bg-gray-800' onSubmit={handleSubmit}>
          <div className='mb-4'>
            <Input
              required
              type='text'
              variant='outlined'
              label={t('connect.server')}
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className='w-full px-3 py-2'
              color={resolvedTheme === 'light' ? 'black' : 'white'}
              data-testid='server'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              required
              type='number'
              variant='outlined'
              label={t('connect.port')}
              value={port}
              onChange={(e) => setPort(+e.target.value)}
              className='w-full px-3 py-2'
              color={resolvedTheme === 'light' ? 'black' : 'white'}
              data-testid='port'
              min={0}
              max={65535}
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='text'
              variant='outlined'
              label={t('connect.username')}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='w-full px-3 py-2'
              color={resolvedTheme === 'light' ? 'black' : 'white'}
              data-testid='username'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type={showPassword ? 'text' : 'password'}
              icon={
                <Button
                  ripple={false}
                  onClick={toggleShowPassword}
                  className='relative overflow-hidden p-0'
                  variant='text'
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className='h-6 w-6 stroke-1 dark:text-white' />
                  ) : (
                    <HiOutlineEye className='h-6 w-6 stroke-1 dark:text-white' />
                  )}
                </Button>
              }
              variant='outlined'
              label={t('connect.password')}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2'
              color={resolvedTheme === 'light' ? 'black' : 'white'}
              data-testid='password'
              crossOrigin=''
            />
          </div>
          <div className='flex flex-row justify-between'>
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
