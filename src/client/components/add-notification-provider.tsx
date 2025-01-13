import React, { useContext, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { HiOutlineXMark, HiOutlinePlus } from 'react-icons/hi2'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { Button, IconButton, Input, Option, Select } from '@material-tailwind/react'
import { NotificationProviders, NotificationTrigger, NotificationTriggerOperations } from '@/common/types'

type AddNotificationProviderProps = {
  initialName: (typeof NotificationProviders)[number]
  initialTriggers: Array<NotificationTrigger>
  initialConfig?: { [x: string]: string }
  handleChange: (
    name: (typeof NotificationProviders)[number],
    triggers: Array<NotificationTrigger>,
    config?: { [x: string]: string }
  ) => void
  handleRemove: () => void
  testNotificationProviderAction: (
    name: (typeof NotificationProviders)[number],
    config?: { [x: string]: string }
  ) => Promise<string>
}

export default function AddNotificationProvider({
  initialName,
  initialTriggers,
  initialConfig,
  handleChange,
  handleRemove,
  testNotificationProviderAction,
}: AddNotificationProviderProps) {
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)
  const [name, setName] = useState<(typeof NotificationProviders)[number]>(initialName)
  const [triggers, setTriggers] = useState<Array<NotificationTrigger>>(initialTriggers)
  const [config, setConfig] = useState<{ [x: string]: string } | undefined>(initialConfig)
  const [connecting, startTransition] = useTransition()

  const handleTestNotification = async () => {
    if (name) {
      startTransition(async () => {
        const promise = testNotificationProviderAction(name, config)
        toast.promise(promise, {
          pending: t('notification.testing'),
          success: t('notification.success'),
          error: t('notification.error'),
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
    <div className='mb-4 w-full rounded-lg bg-gray-200 pb-6 pl-6 dark:bg-gray-600'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='h-12'>
        <IconButton
          variant='text'
          className='text-md float-right px-3 text-black shadow-none dark:text-white'
          title={t('settings.remove')}
          onClick={handleRemove}
        >
          <HiOutlineXMark className='h-6 w-6 stroke-1 dark:text-white' />
        </IconButton>
      </div>
      <div className='pr-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Select
              variant='outlined'
              label={t('notification.name')}
              value={name}
              onChange={(e) => {
                const newName = e as (typeof NotificationProviders)[number]
                setName(newName)
                handleChange(newName, triggers, config)
              }}
              className='w-full px-3 py-2 dark:text-gray-300'
              menuProps={{ className: 'dark:bg-gray-700 dark:border-gray-800 dark:text-white' }}
              labelProps={{ className: 'dark:text-gray-300' }}
              data-testid={name}
            >
              {NotificationProviders.map((np, npIndex) => (
                <Option key={npIndex} value={np}>
                  {np}
                </Option>
              ))}
            </Select>
          </div>
          <h3>{t('notification.trigger.heading')}</h3>
          {triggers.map((trigger, index) => (
            <div className='my-6 border-l-4 border-gray-600 pl-6' key={index}>
              <div className='h-12'>
                <IconButton
                  variant='text'
                  className='text-md float-right px-3 text-black shadow-none dark:text-white'
                  title={t('settings.remove')}
                  onClick={() => {
                    const newTriggers = [...triggers.filter((_trigger, _index) => _index !== index)]
                    setTriggers(newTriggers)
                    handleChange(name, newTriggers, config)
                  }}
                >
                  <HiOutlineXMark className='h-6 w-6 stroke-1 dark:text-white' />
                </IconButton>
              </div>
              <div className='mt-4'>
                <Input
                  required
                  type='text'
                  variant='outlined'
                  label={t('notification.trigger.variable')}
                  value={trigger.variable}
                  onChange={(e) => {
                    trigger.variable = e.target.value
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  className='w-full px-3 py-2'
                  color={theme === 'light' ? 'black' : 'white'}
                  data-testid={`${name}-trigger-variable`}
                  crossOrigin=''
                />
              </div>
              <div className='mt-4'>
                <Select
                  variant='outlined'
                  label={t('notification.trigger.operation')}
                  value={trigger.operation}
                  onChange={(e) => {
                    console.dir(e)
                    trigger.operation = e as (typeof NotificationTriggerOperations)[number]
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  className='w-full px-3 py-2 dark:text-gray-300'
                  menuProps={{ className: 'dark:bg-gray-700 dark:border-gray-800 dark:text-white' }}
                  labelProps={{ className: 'dark:text-gray-300' }}
                  data-testid={`${name}-trigger-operation`}
                >
                  {NotificationTriggerOperations.map((op, opIndex) => (
                    <Option key={opIndex} value={op}>
                      {op}
                    </Option>
                  ))}
                </Select>
              </div>
              <div className='mt-4'>
                <Input
                  type='number'
                  variant='outlined'
                  label={t('notification.trigger.targetValue')}
                  value={trigger.targetValue}
                  onChange={(e) => {
                    trigger.targetValue = e.target.valueAsNumber
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  className='w-full px-3 py-2'
                  color={theme === 'light' ? 'black' : 'white'}
                  data-testid={`${name}-trigger-targetValue`}
                  crossOrigin=''
                />
              </div>
            </div>
          ))}
          <div className='text-center'>
            <Button
              variant='filled'
              title={t('notification.trigger.buttonAdd')}
              className='text-md bg-gray-300 text-black shadow-none dark:bg-gray-600 dark:text-white'
              onClick={() => setTriggers([...triggers, { variable: '', operation: 'changes' }])}
            >
              <HiOutlinePlus className='h-6 w-6 dark:text-white' />
            </Button>
          </div>
          <h3>{t('notification.config.heading')}</h3>
          {config &&
            Object.keys(config).map((k, index) => (
              <div className='my-6 border-l-4 border-gray-600 pl-6' key={index}>
                <div className='h-12'>
                  <IconButton
                    variant='text'
                    className='text-md float-right px-3 text-black shadow-none dark:text-white'
                    title={t('settings.remove')}
                    onClick={() => {
                      delete config[k]
                      setConfig(config)
                      handleChange(name, triggers, config)
                    }}
                  >
                    <HiOutlineXMark className='h-6 w-6 stroke-1 dark:text-white' />
                  </IconButton>
                </div>
                <div className='mt-4'>
                  <Input
                    required
                    type='text'
                    variant='outlined'
                    label={t('notification.config.propertyName')}
                    value={k}
                    onChange={(e) => {
                      const newConfig = {
                        ...config,
                      }
                      console.log(k)
                      const configValue = newConfig[k]
                      delete newConfig[k]
                      newConfig[e.target.value] = configValue
                      setConfig(newConfig)
                      handleChange(name, triggers, newConfig)
                    }}
                    className='w-full px-3 py-2'
                    color={theme === 'light' ? 'black' : 'white'}
                    data-testid={`${name}-config-key`}
                    crossOrigin=''
                  />
                </div>
                <div className='mt-4'>
                  <Input
                    type='text'
                    variant='outlined'
                    label={t('notification.config.propertyValue')}
                    value={config[k]}
                    onChange={(e) => {
                      const newConfig = { ...config, [k]: e.target.value }
                      setConfig(newConfig)
                      handleChange(name, triggers, newConfig)
                    }}
                    className='w-full px-3 py-2'
                    color={theme === 'light' ? 'black' : 'white'}
                    data-testid={`${name}-config-value`}
                    crossOrigin=''
                  />
                </div>
              </div>
            ))}
          <div className='text-center'>
            <Button
              variant='filled'
              title={t('notification.config.buttonAdd')}
              className='text-md bg-gray-300 text-black shadow-none dark:bg-gray-600 dark:text-white'
              onClick={() => setConfig({ ...config, property: 'value' })}
            >
              <HiOutlinePlus className='h-6 w-6 dark:text-white' />
            </Button>
          </div>
          <div className='flex flex-row justify-between'>
            <div />
            <Button
              disabled={connecting}
              onClick={async () => handleTestNotification()}
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
