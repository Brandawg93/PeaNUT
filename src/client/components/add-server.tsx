import React, { useContext, useState, useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster, toast } from 'sonner'
import { HiOutlineXMark, HiOutlineEllipsisVertical } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Card } from '@/client/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/client/components/ui/dropdown-menu'
import PasswordInput from '@/client/components/ui/password-input'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/client/components/ui/tooltip'

const PING_INTERVAL = 10000

type AddServerProps = Readonly<{
  initialServer: string
  initialPort: number
  initialName: string | undefined
  initialUsername: string | undefined
  initialPassword: string | undefined
  initialDisabled?: boolean
  handleChange: (
    server: string,
    port: number,
    name?: string,
    username?: string,
    password?: string,
    disabled?: boolean
  ) => void
  handleRemove: () => void
  testConnectionAction: (server: string, port: number, username?: string, password?: string) => Promise<string>
  saved?: boolean
}>

export default function AddServer({
  initialServer,
  initialPort,
  initialName,
  initialUsername,
  initialPassword,
  initialDisabled,
  handleChange,
  handleRemove,
  testConnectionAction,
  saved,
}: AddServerProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useTheme()
  const [server, setServer] = useState<string>(initialServer ?? '')
  const [port, setPort] = useState<number>(initialPort ?? 3493)
  const [name, setName] = useState<string | undefined>(initialName ?? '')
  const [username, setUsername] = useState<string | undefined>(initialUsername ?? '')
  const [password, setPassword] = useState<string | undefined>(initialPassword ?? '')
  const [disabled, setDisabled] = useState<boolean>(initialDisabled ?? false)
  const [connectionStatus, setConnectionStatus] = useState<'success' | 'error' | 'untested'>('untested')

  const handleTestConnection = useCallback(
    async (hideToast = false) => {
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
    },
    [server, port, username, password, t, testConnectionAction]
  )

  const pingIcon = () => {
    if (disabled) {
      return (
        <span className='relative flex h-3 w-3'>
          <span className='bg-muted-foreground relative inline-flex h-3 w-3 rounded-full'></span>
        </span>
      )
    }
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
    if (saved && !disabled) {
      // Schedule the initial connection test to avoid synchronous setState in effect
      const testConnection = () => {
        handleTestConnection(true)
      }
      testConnection()
      interval = setInterval(testConnection, PING_INTERVAL)

      return () => clearInterval(interval)
    }
  }, [saved, disabled, handleTestConnection])

  return (
    <TooltipProvider>
      <Card className='border-border bg-card mb-4 w-full gap-0 border pt-0 shadow-none'>
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
            <div className='mb-6'>
              <Label htmlFor='serverName'>{t('connect.name')}</Label>
              <Input
                type='text'
                id='serverName'
                value={name}
                disabled={disabled}
                placeholder={t('connect.namePlaceholder')}
                onChange={(e) => {
                  setName(e.target.value)
                  handleChange(server, port, e.target.value, username, password, disabled)
                }}
                className='border-border-card bg-background! mt-1 w-full px-3 py-2'
                data-testid='name'
              />
            </div>
            <div className='mb-6'>
              <Label htmlFor='serverHost'>{t('connect.server')}</Label>
              <Input
                required
                type='text'
                id='serverHost'
                value={server}
                disabled={disabled}
                onChange={(e) => {
                  setServer(e.target.value)
                  handleChange(e.target.value, port, name, username, password, disabled)
                }}
                className='border-border-card bg-background! mt-1 w-full px-3 py-2'
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
                disabled={disabled}
                onChange={(e) => {
                  setPort(+e.target.value)
                  handleChange(server, +e.target.value, name, username, password, disabled)
                }}
                className='border-border-card bg-background! mt-1 w-full px-3 py-2'
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
                disabled={disabled}
                onChange={(e) => {
                  setUsername(e.target.value)
                  handleChange(server, port, name, e.target.value, password, disabled)
                }}
                className='border-border-card bg-background! mt-1 w-full px-3 py-2'
                data-testid='username'
              />
            </div>
            <div className='mb-6'>
              <Label htmlFor='password'>{t('connect.password')}</Label>
              <PasswordInput
                id='password'
                value={password}
                disabled={disabled}
                onChange={(e) => {
                  setPassword(e.target.value)
                  handleChange(server, port, name, username, e.target.value, disabled)
                }}
                data-testid='password'
              />
            </div>
            <div className='flex flex-row justify-between'>
              <div />
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button variant='ghost' className='cursor-pointer shadow-none' title='options' aria-label='options'>
                    <HiOutlineEllipsisVertical className='size-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem disabled={disabled} onClick={() => handleTestConnection()} data-testid='menu-test'>
                    {t('connect.test')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      const next = !disabled
                      setDisabled(next)
                      setConnectionStatus('untested')
                      handleChange(server, port, name, username, password, next)
                    }}
                    data-testid='menu-toggle'
                  >
                    {disabled ? t('settings.enable') : t('settings.disable')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </form>
        </div>
      </Card>
    </TooltipProvider>
  )
}
