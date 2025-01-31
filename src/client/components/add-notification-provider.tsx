import React, { useContext, useState, useTransition } from 'react'
import { useTranslation } from 'react-i18next'
import { Toaster, toast } from 'sonner'
import { HiOutlineXMark, HiOutlinePlus } from 'react-icons/hi2'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { Button } from '@/client/components/ui/button'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
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
  const { theme } = useTheme()
  const [name, setName] = useState<(typeof NotificationProviders)[number]>(initialName)
  const [triggers, setTriggers] = useState<Array<NotificationTrigger>>(initialTriggers)
  const [config, setConfig] = useState<{ [x: string]: string } | undefined>(initialConfig)
  const [connecting, startTransition] = useTransition()

  const handleTestNotification = async () => {
    if (name) {
      startTransition(async () => {
        const promise = testNotificationProviderAction(name, config)
        toast.promise(promise, {
          loading: t('notification.testing'),
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
    <div className='mb-4 w-full rounded-lg bg-card pb-6 pl-6'>
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
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
      <div className='pr-6'>
        <form className='w-full'>
          <div className='mb-4'>
            <Select
              onValueChange={(e) => {
                const newName = e as (typeof NotificationProviders)[number]
                setName(newName)
                handleChange(newName, triggers, config)
              }}
              value={name}
            >
              <SelectTrigger className='w-full border-border-card px-3 py-2'>
                <SelectValue placeholder={t('notification.name')} />
              </SelectTrigger>
              <SelectContent>
                {NotificationProviders.map((np, npIndex) => (
                  <SelectItem key={npIndex} value={np}>
                    {np}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <h3>{t('notification.trigger.heading')}</h3>
          {triggers.map((trigger, index) => (
            <div className='my-6 border-l-4 border-gray-600 pl-6' key={index}>
              <div className='h-12'>
                <Button
                  variant='ghost'
                  className='text-md float-right px-3 shadow-none'
                  title={t('settings.remove')}
                  onClick={() => {
                    const newTriggers = [...triggers.filter((_trigger, _index) => _index !== index)]
                    setTriggers(newTriggers)
                    handleChange(name, newTriggers, config)
                  }}
                >
                  <HiOutlineXMark className='h-6 w-6 stroke-1' />
                </Button>
              </div>
              <div className='mt-4'>
                <Label htmlFor='notificationTriggerVariable'>{t('notification.trigger.variable')}</Label>
                <Input
                  required
                  id='notificationTriggerVariable'
                  type='text'
                  value={trigger.variable}
                  onChange={(e) => {
                    trigger.variable = e.target.value
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  className='w-full px-3 py-2'
                  data-testid={`${name}-trigger-variable`}
                />
              </div>
              <div className='mt-4'>
                <Select
                  onValueChange={(e) => {
                    console.dir(e)
                    trigger.operation = e as (typeof NotificationTriggerOperations)[number]
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  value={name}
                >
                  <SelectTrigger className='w-full border-border-card px-3 py-2'>
                    <SelectValue placeholder={t('notification.trigger.operation')} />
                  </SelectTrigger>
                  <SelectContent>
                    {NotificationTriggerOperations.map((op, opIndex) => (
                      <SelectItem key={opIndex} value={op}>
                        {op}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className='mt-4'>
                <Label htmlFor='notificationTriggerTargetValue'>{t('notification.trigger.targetValue')}</Label>
                <Input
                  type='number'
                  id='notificationTriggerTargetValue'
                  value={trigger.targetValue}
                  onChange={(e) => {
                    trigger.targetValue = e.target.valueAsNumber
                    setTriggers([...triggers])
                    handleChange(name, triggers, config)
                  }}
                  className='w-full px-3 py-2'
                  data-testid={`${name}-trigger-targetValue`}
                />
              </div>
            </div>
          ))}
          <div className='text-center'>
            <Button
              variant='secondary'
              title={t('notification.trigger.buttonAdd')}
              className='shadow-none'
              onClick={() => setTriggers([...triggers, { variable: '', operation: 'changes' }])}
            >
              <HiOutlinePlus className='!h-6 !w-6' />
            </Button>
          </div>
          <h3>{t('notification.config.heading')}</h3>
          {config &&
            Object.keys(config).map((k, index) => (
              <div className='my-6 border-l-4 border-gray-600 pl-6' key={index}>
                <div className='h-12'>
                  <Button
                    variant='ghost'
                    className='text-md float-right px-3 shadow-none'
                    title={t('settings.remove')}
                    onClick={() => {
                      delete config[k]
                      setConfig(config)
                      handleChange(name, triggers, config)
                    }}
                  >
                    <HiOutlineXMark className='h-6 w-6 stroke-1' />
                  </Button>
                </div>
                <div className='mt-4'>
                  <Label htmlFor='notificationConfigPropertyName'>{t('notification.config.propertyName')}</Label>
                  <Input
                    required
                    type='text'
                    id='notificationConfigPropertyName'
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
                    data-testid={`${name}-config-key`}
                  />
                </div>
                <div className='mt-4'>
                  <Label htmlFor='notificationConfigPropertyValue'>{t('notification.config.propertyValue')}</Label>
                  <Input
                    type='text'
                    id='notificationConfigPropertyValue'
                    value={config[k]}
                    onChange={(e) => {
                      const newConfig = { ...config, [k]: e.target.value }
                      setConfig(newConfig)
                      handleChange(name, triggers, newConfig)
                    }}
                    className='w-full px-3 py-2'
                    data-testid={`${name}-config-value`}
                  />
                </div>
              </div>
            ))}
          <div className='text-center'>
            <Button
              variant='secondary'
              title={t('notification.config.buttonAdd')}
              className='shadow-none'
              onClick={() => setConfig({ ...config, property: 'value' })}
            >
              <HiOutlinePlus className='!h-6 !w-6' />
            </Button>
          </div>
          <div className='flex flex-row justify-between'>
            <div />
            <Button
              variant='destructive'
              disabled={connecting}
              onClick={async () => handleTestNotification()}
              className='shadow-none'
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
