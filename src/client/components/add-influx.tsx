import React, { useContext, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button, Input } from '@material-tailwind/react'

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
    <div className='mb-4 mt-1 w-full rounded-lg bg-secondary pb-6 pl-6'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='pr-6 pt-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Input
              required
              type='text'
              variant='outlined'
              label={t('connect.server')}
              value={server}
              onChange={(e) => {
                setServer(e.target.value)
                handleChange(e.target.value, token, org, bucket, interval)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='server'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              required
              type={showPassword ? 'text' : 'password'}
              icon={
                <Button
                  data-testid='show-password'
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
              label={t('connect.token')}
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
                handleChange(server, e.target.value, org, bucket, interval)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='token'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              required
              type='text'
              variant='outlined'
              label={t('connect.org')}
              value={org}
              onChange={(e) => {
                setOrg(e.target.value)
                handleChange(server, token, e.target.value, bucket, interval)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='org'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              required
              type='text'
              variant='outlined'
              label={t('connect.bucket')}
              value={bucket}
              onChange={(e) => {
                setBucket(e.target.value)
                handleChange(server, token, org, e.target.value, interval)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='bucket'
              crossOrigin=''
            />
          </div>
          <div className='mb-6'>
            <Input
              type='number'
              variant='outlined'
              label={t('settings.influxInterval')}
              value={interval}
              onChange={(e) => {
                setInterval(+e.target.value)
                handleChange(server, token, org, bucket, +e.target.value)
              }}
              className='w-full px-3 py-2'
              color={theme === 'light' ? 'black' : 'white'}
              data-testid='interval'
              crossOrigin=''
            />
          </div>
          <div className='flex flex-row justify-between'>
            <Button
              disabled={connecting}
              onClick={async () => handleClearForm()}
              className='font-bold text-white shadow-none'
              type='button'
            >
              {t('connect.clear')}
            </Button>
            <Button
              disabled={connecting}
              onClick={async () => handleTestConnection()}
              className='bg-red-500 font-bold text-white shadow-none hover:bg-red-700'
              type='button'
            >
              {t('connect.test')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
