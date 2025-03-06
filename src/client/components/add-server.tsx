import React, { useContext, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster, toast } from 'sonner'
import { HiOutlineXMark, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Card } from '@/client/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/client/components/ui/tooltip'

const PING_INTERVAL = 10000

type AddServerProps = {
  initialServer: string
  initialPort: number
  initialUsername: string | undefined
  initialPassword: string | undefined
  handleChange: (server: string, port: number, username?: string, password?: string) => void
  handleRemove: () => void
  testConnectionAction: (server: string, port: number, username?: string, password?: string) => Promise<string>
  saved?: boolean
}

export default function AddServer({
  initialServer,
  initialPort,
  initialUsername,
  initialPassword,
  handleChange,
  handleRemove,
  testConnectionAction,
  saved,
}: AddServerProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useTheme()
  const [server, setServer] = useState<string>(initialServer)
  const [port, setPort] = useState<number>(initialPort)
  const [username, setUsername] = useState<string | undefined>(initialUsername)
  const [password, setPassword] = useState<string | undefined>(initialPassword)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'untested'>('untested')
  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handleTestConnection = async (hideToast = false) => {
    if (server && port) {
      const promise = testConnectionAction(server, port, username, password)
      if (!hideToast) {
        toast.promise(promise, {
          loading: t('connect.testing'),
          success: t('connect.success'),
          error: t('connect.error'),
        })
      }
      try {
        await promise
        if (hideToast) {
          setConnectionStatus('success')
        }
      } catch {
        if (hideToast) {
          setConnectionStatus('error')
        }
      }
    }
  }

  const pingIcon = () => {
    switch (connectionStatus) {
      case 'success':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='relative flex h-3 w-3'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75'></span>
                <span className='relative inline-flex h-3 w-3 rounded-full bg-green-500'></span>
              </span>
            </TooltipTrigger>
            <TooltipContent side='right'>{t('connect.success')}</TooltipContent>
          </Tooltip>
        )
      case 'error':
        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <span className='relative flex h-3 w-3'>
                <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75'></span>
                <span className='relative inline-flex h-3 w-3 rounded-full bg-red-500'></span>
              </span>
            </TooltipTrigger>
            <TooltipContent side='right'>{t('connect.error')}</TooltipContent>
          </Tooltip>
        )
      case 'untested':
      default:
        return (
          <span className='relative flex h-3 w-3'>
            <span className='bg-muted-foreground relative inline-flex h-3 w-3 rounded-full'></span>
          </span>
        )
    }
  }

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined
    if (saved) {
      handleTestConnection(true)
      interval = setInterval(() => {
        handleTestConnection(true)
      }, PING_INTERVAL)

      return () => clearInterval(interval)
    }
  }, [saved])

  return (
    <TooltipProvider>
      <Card className='border-border bg-card mb-4 w-full border pb-6 shadow-none'>
        <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
        <div className='flex justify-between'>
          <div className='pt-2 pl-2'>{pingIcon()}</div>
          <Button
            variant='ghost'
            className='text-md cursor-pointer px-3 shadow-none'
            title={t('settings.remove')}
            onClick={handleRemove}
          >
            <HiOutlineXMark className='size-6!' />
          </Button>
        </div>
        <div className='px-6'>
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
                  className='border-border-card bg-background relative cursor-pointer overflow-hidden rounded-l-none border border-l-0 p-0'
                  variant='ghost'
                  type='button'
                >
                  <div className='text-muted-foreground'>
                    {showPassword ? <HiOutlineEyeSlash className='stroke-1' /> : <HiOutlineEye className='stroke-1' />}
                  </div>
                </Button>
              </div>
            </div>
            <div className='flex flex-row justify-between'>
              <div />
              <Button
                variant='destructive'
                onClick={async () => handleTestConnection()}
                className='cursor-pointer font-bold shadow-none'
                type='button'
              >
                {t('connect.test')}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </TooltipProvider>
  )
}
