import React, { useContext, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster, toast } from 'sonner'
import { HiOutlineXMark, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Card } from '@/client/components/ui/card'

type AddServerProps = {
  initialServer: string
  initialPort: number
  initialUsername: string | undefined
  initialPassword: string | undefined
  handleChange: (server: string, port: number, username?: string, password?: string) => void
  handleRemove: () => void
  testConnectionAction: (server: string, port: number) => Promise<string>
  removable?: boolean
}

export default function AddServer({
  initialServer,
  initialPort,
  initialUsername,
  initialPassword,
  handleChange,
  handleRemove,
  testConnectionAction,
  removable,
}: AddServerProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useTheme()
  const [server, setServer] = useState<string>(initialServer)
  const [port, setPort] = useState<number>(initialPort)
  const [username, setUsername] = useState<string | undefined>(initialUsername)
  const [password, setPassword] = useState<string | undefined>(initialPassword)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [connecting, startTransition] = useTransition()
  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handleTestConnection = async () => {
    if (server && port) {
      startTransition(async () => {
        const promise = testConnectionAction(server, port)
        toast.promise(promise, {
          loading: t('connect.testing'),
          success: t('connect.success'),
          error: t('connect.error'),
        })
        try {
          await promise
        } catch {
          // Do nothing
        }
      })
    }
  }

  return (
    <Card className='border-border bg-card mb-4 w-full border pb-6 pl-6 shadow-none'>
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      {removable ? (
        <div className='h-12'>
          <Button
            variant='ghost'
            className='text-md float-right px-3 shadow-none'
            title={t('settings.remove')}
            onClick={handleRemove}
          >
            <HiOutlineXMark className='h-6 w-6 stroke-1' />
          </Button>
        </div>
      ) : (
        <div className='pt-6' />
      )}
      <div className='pr-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Label htmlFor='serverHost'>{t('connect.server')}</Label>
            <Input
              required
              type='text'
              id='serverHost'
              value={server}
              onChange={(e) => {
                setServer(e.target.value)
                handleChange(e.target.value, port, username, password)
              }}
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
              onChange={(e) => {
                setPort(+e.target.value)
                handleChange(server, +e.target.value, username, password)
              }}
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
              onChange={(e) => {
                setUsername(e.target.value)
                handleChange(server, port, e.target.value, password)
              }}
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
                onChange={(e) => {
                  setPassword(e.target.value)
                  handleChange(server, port, username, e.target.value)
                }}
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
                {showPassword ? (
                  <HiOutlineEyeSlash className='h-6 w-6 stroke-1' />
                ) : (
                  <HiOutlineEye className='h-6 w-6 stroke-1' />
                )}
              </Button>
            </div>
          </div>
          <div className='flex flex-row justify-between'>
            <div />
            <Button
              variant='destructive'
              disabled={connecting}
              onClick={async () => handleTestConnection()}
              className='font-bold shadow-none'
              type='button'
            >
              {t('connect.test')}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
