'use client'

import React, { useContext } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { Toaster, toast } from 'sonner'
import { Card } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { LanguageContext } from '@/client/context/language'
import { useTheme } from 'next-themes'
import { LuLoader } from 'react-icons/lu'
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
  const { theme } = useTheme()
  const { t } = useTranslation(lng)
  const router = useRouter()

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
        loading: t('connect.testing'),
        success: () => {
          setConnecting(false)
          return t('connect.success')
        },
        error: () => {
          setConnecting(false)
          return t('connect.error')
        },
      })
    }
  }

  const getTestButton = () => {
    if (connecting) {
      return (
        <div>
          <LuLoader className='animate-spin' />
        </div>
      )
    } else {
      return <>{t('connect.test')}</>
    }
  }

  return (
    <div
      className='bg-background absolute top-0 left-0 flex h-full w-full flex-col items-center justify-center text-center'
      data-testid='login-wrapper'
    >
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      <div className='mb-8 flex justify-center'>
        <Image alt='' src={logo} width='100' height='100' className='d-inline-block align-top' />
      </div>
      <div>
        <h1 className='mb-4 text-4xl font-bold'>PeaNUT</h1>
      </div>
      <Card className='border-border bg-card relative flex flex-row justify-around overflow-hidden border shadow-md'>
        <form className='bg-card w-full max-w-sm p-6' onSubmit={handleSubmit}>
          <div className='mb-4'>
            <Label htmlFor='serverHost'>{t('connect.server')}</Label>
            <Input
              required
              type='text'
              id='serverHost'
              value={server}
              onChange={(e) => setServer(e.target.value)}
              className='border-border-card bg-background w-full px-3 py-2'
              data-testid='server'
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='serverPort'>{t('connect.port')}</Label>
            <Input
              required
              type='number'
              id='serverPort'
              value={port}
              onChange={(e) => setPort(+e.target.value)}
              className='border-border-card bg-background w-full px-3 py-2'
              data-testid='port'
              min={0}
              max={65535}
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='username'>{t('connect.username')}</Label>
            <Input
              type='text'
              id='username'
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className='border-border-card bg-background w-full px-3 py-2'
              data-testid='username'
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='password'>{t('connect.password')}</Label>
            <div className='flex'>
              <Input
                type={showPassword ? 'text' : 'password'}
                id='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className='border-border-card bg-background z-10 rounded-r-none border-r-0 px-3 py-2 focus:rounded focus:border-r'
                data-testid='password'
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
          <div className='flex flex-row justify-between'>
            <Button
              variant='destructive'
              disabled={connecting}
              onClick={async () => handleTestConnection()}
              className='font-bold shadow-none'
              type='button'
            >
              {getTestButton()}
            </Button>
            <Button variant='default' disabled={connecting} className='px-4 py-2 font-bold' type='submit'>
              {t('connect.connect')}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
