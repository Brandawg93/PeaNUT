import React, { useContext, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Card } from '@/client/components/ui/card'

type AddInfluxProps = {
  initialValues: { server: string; token: string; org: string; bucket: string; interval: number }
  handleChange: (server: string, token: string, org: string, bucket: string, interval: number) => void
  handleClear: () => void
  testInfluxConnectionAction: (
    server: string,
    token: string,
    org: string,
    bucket: string,
    interval: number
  ) => Promise<void>
}

export default function AddInflux({
  initialValues,
  handleChange,
  handleClear,
  testInfluxConnectionAction,
}: AddInfluxProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useTheme()
  const [server, setServer] = useState<string>(initialValues.server)
  const [token, setToken] = useState<string>(initialValues.token)
  const [org, setOrg] = useState<string>(initialValues.org)
  const [bucket, setBucket] = useState<string>(initialValues.bucket)
  const [interval, setInterval] = useState<number>(initialValues.interval)
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [connecting, startTransition] = useTransition()

  const toggleShowPassword = () => setShowPassword(!showPassword)

  const handleTestConnection = async () => {
    if (server && token && org && bucket) {
      startTransition(async () => {
        const promise = testInfluxConnectionAction(server, token, org, bucket, interval)
        toast.promise(promise, {
          pending: t('connect.testing'),
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

  const handleClearForm = () => {
    setServer('')
    setToken('')
    setOrg('')
    setBucket('')
    setInterval(10)
    handleClear()
  }

  return (
    <Card className='mb-4 mt-1 w-full border border-border bg-card pb-6 pl-6 shadow-none'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='pr-6 pt-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Label htmlFor='influxHost'>{t('connect.server')}</Label>
            <Input
              required
              type='text'
              id='influxHost'
              value={server}
              onChange={(e) => {
                setServer(e.target.value)
                handleChange(e.target.value, token, org, bucket, interval)
              }}
              className='w-full border-border-card bg-background px-3 py-2'
              data-testid='server'
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='influxToken'>{t('connect.token')}</Label>
            <div className='flex'>
              <Input
                required
                type={showPassword ? 'text' : 'password'}
                id='influxToken'
                value={token}
                onChange={(e) => {
                  setToken(e.target.value)
                  handleChange(server, e.target.value, org, bucket, interval)
                }}
                className='z-10 rounded-r-none border-r-0 border-border-card bg-background px-3 py-2 focus:rounded focus:border-r'
                data-testid='token'
              />
              <Button
                size='icon'
                data-testid='show-password'
                onClick={toggleShowPassword}
                className='relative overflow-hidden rounded-l-none border border-l-0 border-border-card bg-background p-0'
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
          <div className='mb-6'>
            <Label htmlFor='influxOrg'>{t('connect.org')}</Label>
            <Input
              required
              type='text'
              id='influxOrg'
              value={org}
              onChange={(e) => {
                setOrg(e.target.value)
                handleChange(server, token, e.target.value, bucket, interval)
              }}
              className='border-border-card bg-background px-3 py-2'
              data-testid='org'
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='influxBucket'>{t('connect.bucket')}</Label>
            <Input
              required
              type='text'
              id='influxBucket'
              value={bucket}
              onChange={(e) => {
                setBucket(e.target.value)
                handleChange(server, token, org, e.target.value, interval)
              }}
              className='w-full border-border-card bg-background px-3 py-2'
              data-testid='bucket'
            />
          </div>
          <div className='mb-6'>
            <Label htmlFor='influxInterval'>{t('settings.influxInterval')}</Label>
            <Input
              type='number'
              id='influxInterval'
              value={interval}
              onChange={(e) => {
                setInterval(+e.target.value)
                handleChange(server, token, org, bucket, +e.target.value)
              }}
              className='w-full border-border-card bg-background px-3 py-2'
              data-testid='interval'
            />
          </div>
          <div className='flex flex-row justify-between'>
            <Button
              variant='secondary'
              disabled={connecting}
              onClick={async () => handleClearForm()}
              className='font-bold shadow-none'
              type='button'
            >
              {t('connect.clear')}
            </Button>
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
