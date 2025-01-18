'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Button, Card, List, ListItem, ListItemPrefix } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { ThemeContext } from '@/client/context/theme'
import { LanguageContext } from '@/client/context/language'
import { SiInfluxdb } from 'react-icons/si'
import { HiOutlineServerStack, HiOutlinePlus, HiOutlineInformationCircle, HiOutlineBellAlert } from 'react-icons/hi2'
import Footer from '@/client/components/footer'
import AddServer from '@/client/components/add-server'
import AddNotificationProvider from '@/client/components/add-notification-provider'
import AddInflux from './add-influx'
import { SettingsType } from '@/server/settings'
import { NotificationProviders, NotificationTrigger, NotifierSettings, server } from '@/common/types'

type SettingsWrapperProps = {
  checkSettingsAction: () => Promise<boolean>
  getSettingsAction: <K extends keyof SettingsType>(key: K) => Promise<any>
  setSettingsAction: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>
  deleteSettingsAction: (key: keyof SettingsType) => Promise<void>
  updateServersAction: (newServers: Array<server>) => Promise<void>
  testConnectionAction: (server: string, port: number) => Promise<string>
  testInfluxConnectionAction: (server: string, token: string, org: string, bucket: string) => Promise<void>
  updateNotificationProvidersAction: (newNotificationProviders: Array<NotifierSettings>) => Promise<void>
  testNotificationProviderAction: (
    name: (typeof NotificationProviders)[number],
    config: { [x: string]: string } | undefined
  ) => Promise<string>
}

export default function SettingsWrapper({
  checkSettingsAction,
  getSettingsAction,
  setSettingsAction,
  deleteSettingsAction,
  updateServersAction,
  testConnectionAction,
  testInfluxConnectionAction,
  updateNotificationProvidersAction,
  testNotificationProviderAction,
}: SettingsWrapperProps) {
  const [selected, setSelected] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [serverList, setServerList] = useState<Array<server>>([])
  const [influxServer, setInfluxServer] = useState<string>('')
  const [influxToken, setInfluxToken] = useState<string>('')
  const [influxOrg, setInfluxOrg] = useState<string>('')
  const [influxBucket, setInfluxBucket] = useState<string>('')
  const [influxInterval, setInfluxInterval] = useState<number>(10)
  const [notificationProvidersList, setNotificationProvidersList] = useState<Array<NotifierSettings>>([])
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { theme } = useContext(ThemeContext)

  const router = useRouter()

  const setSelectedItem = (value: number) => setSelected(value)
  const selectedStyle = { color: 'black', fill: 'black' }

  useEffect(() => {
    checkSettingsAction().then(async (res) => {
      setSettingsLoaded(true)
      if (!res) {
        router.replace('/login')
      } else {
        const [servers, influxHost, influxToken, influxOrg, influxBucket, influxInterval, notificationProviders] =
          await Promise.all([
            getSettingsAction('NUT_SERVERS'),
            getSettingsAction('INFLUX_HOST'),
            getSettingsAction('INFLUX_TOKEN'),
            getSettingsAction('INFLUX_ORG'),
            getSettingsAction('INFLUX_BUCKET'),
            getSettingsAction('INFLUX_INTERVAL'),
            getSettingsAction('NOTIFICATION_PROVIDERS'),
          ])
        if (servers) {
          setServerList([...servers])
        }
        if (notificationProviders) {
          setNotificationProvidersList([...notificationProviders])
        }
        if (influxHost && influxToken && influxOrg && influxBucket) {
          setInfluxServer(influxHost)
          setInfluxToken(influxToken)
          setInfluxOrg(influxOrg)
          setInfluxBucket(influxBucket)
        }
        if (influxInterval) {
          setInfluxInterval(influxInterval)
        }
      }
    })
  }, [])

  const handleServerChange = (
    server: string,
    port: number,
    username: string | undefined,
    password: string | undefined,
    index: number
  ) => {
    const updatedServerList = [...serverList]
    updatedServerList[index].HOST = server
    updatedServerList[index].PORT = port
    updatedServerList[index].USERNAME = username
    updatedServerList[index].PASSWORD = password
    setServerList(updatedServerList)
  }

  const handleServerRemove = async (index: number) => {
    const updatedServerList = serverList.filter((_, i) => i !== index)
    setServerList(updatedServerList)
    await updateServersAction(updatedServerList)
  }

  const handleSaveServers = async () => {
    await updateServersAction(serverList)
    toast.success(t('settings.saved'))
  }

  const handleSaveInflux = async () => {
    await Promise.all([
      setSettingsAction('INFLUX_HOST', influxServer),
      setSettingsAction('INFLUX_TOKEN', influxToken),
      setSettingsAction('INFLUX_ORG', influxOrg),
      setSettingsAction('INFLUX_BUCKET', influxBucket),
      setSettingsAction('INFLUX_INTERVAL', influxInterval),
    ])
    toast.success(t('settings.saved'))
  }

  const handleNotificationProviderChange = (
    name: (typeof NotificationProviders)[number],
    triggers: Array<NotificationTrigger>,
    config: { [x: string]: string } | undefined,
    index: number
  ) => {
    const updatedNotificationProvidersList = [...notificationProvidersList]
    updatedNotificationProvidersList[index].name = name
    updatedNotificationProvidersList[index].triggers = triggers
    updatedNotificationProvidersList[index].config = config
    setNotificationProvidersList(updatedNotificationProvidersList)
  }

  const handleNotificationProviderRemove = async (index: number) => {
    const updatedNotificationProvidersList = notificationProvidersList.filter((_, i) => i !== index)
    setNotificationProvidersList(updatedNotificationProvidersList)
    await updateNotificationProvidersAction(updatedNotificationProvidersList)
  }

  const handleSaveNotificationProviders = async () => {
    await updateNotificationProvidersAction(notificationProvidersList)
    toast.success(t('settings.saved'))
  }

  const skeleton = (
    <div className='flex flex-col gap-3'>
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
    </div>
  )

  const menuItems = [
    { label: t('settings.manageServers'), Icon: HiOutlineServerStack },
    { label: t('settings.influxDb'), Icon: SiInfluxdb },
    { label: t('settings.manageNotifications'), Icon: HiOutlineBellAlert },
  ]

  return (
    <div className='flex flex-1 flex-col pl-3 pr-3' data-testid='settings-wrapper'>
      <ToastContainer position='top-center' theme={theme} />
      <div className='flex justify-center'>
        <div className='container'>
          <h1 className='mb-4 text-2xl font-bold'>{t('sidebar.settings')}</h1>
        </div>
      </div>
      <div className='flex flex-1 justify-center'>
        <div className='container flex flex-col justify-between'>
          <div className='flex flex-row gap-2'>
            <div>
              <Card className='bg-white dark:bg-gray-800'>
                <List className='min-w-0'>
                  {menuItems.map(({ label, Icon }, index) => (
                    <ListItem
                      key={index}
                      selected={selected === index}
                      onClick={() => setSelectedItem(index)}
                      className='active: text-black hover:text-black dark:text-white'
                      style={selected === index ? selectedStyle : {}}
                    >
                      <ListItemPrefix className='mr-0 lg:mr-4'>
                        <Icon className='h-6 w-6' style={selected === index ? { color: 'black' } : {}} />
                      </ListItemPrefix>
                      <span className='hidden lg:block'>{label}</span>
                    </ListItem>
                  ))}
                </List>
              </Card>
            </div>
            <div className='flex h-full flex-1 flex-col gap-3 overflow-auto rounded-lg bg-white p-3 dark:bg-gray-800'>
              {settingsLoaded ? (
                <>
                  {selected === 0 && (
                    <div className='flex h-full flex-col justify-between'>
                      <div className='container'>
                        <h2 className='mb-4 text-xl font-bold'>{t('settings.manageServers')}</h2>
                        {serverList.map((server, index) => (
                          <AddServer
                            removable={serverList.length > 1}
                            key={index}
                            initialServer={server.HOST}
                            initialPort={server.PORT}
                            initialUsername={server.USERNAME}
                            initialPassword={server.PASSWORD}
                            handleChange={(server, port, username, password) =>
                              handleServerChange(server, port, username, password, index)
                            }
                            handleRemove={() => handleServerRemove(index)}
                            testConnectionAction={testConnectionAction}
                          />
                        ))}
                        <div className='text-center'>
                          <Button
                            variant='filled'
                            title={t('settings.addServer')}
                            className='text-md bg-gray-300 text-black shadow-none dark:bg-gray-600 dark:text-white'
                            onClick={() => setServerList([...serverList, { HOST: '', PORT: 0 }])}
                          >
                            <HiOutlinePlus className='h-6 w-6 dark:text-white' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex flex-row justify-between'>
                        <div />
                        <Button onClick={handleSaveServers} className='shadow-none'>
                          {t('settings.apply')}
                        </Button>
                      </div>
                    </div>
                  )}
                  {selected === 1 && (
                    <div className='flex h-full flex-col justify-between'>
                      <div className='container'>
                        <h2 className='mb-4 text-xl font-bold'>{t('settings.influxDb')}</h2>
                        <span className='text-sm text-gray-500'>
                          <HiOutlineInformationCircle className='inline-block h-4 w-4' />
                          {t('settings.influxNotice')}
                        </span>
                        <AddInflux
                          initialValues={{
                            server: influxServer,
                            token: influxToken,
                            org: influxOrg,
                            bucket: influxBucket,
                            interval: influxInterval,
                          }}
                          handleChange={(server, token, org, bucket, interval) => {
                            setInfluxServer(server)
                            setInfluxToken(token)
                            setInfluxOrg(org)
                            setInfluxBucket(bucket)
                            setInfluxInterval(interval)
                          }}
                          handleClear={() => {
                            setInfluxServer('')
                            setInfluxToken('')
                            setInfluxOrg('')
                            setInfluxBucket('')
                            setInfluxInterval(10)
                            deleteSettingsAction('INFLUX_HOST')
                            deleteSettingsAction('INFLUX_TOKEN')
                            deleteSettingsAction('INFLUX_ORG')
                            deleteSettingsAction('INFLUX_BUCKET')
                            setSettingsAction('INFLUX_INTERVAL', 10)
                          }}
                          testInfluxConnectionAction={testInfluxConnectionAction}
                        />
                      </div>
                      <div className='flex flex-row justify-between'>
                        <div />
                        <Button onClick={handleSaveInflux} className='shadow-none'>
                          {t('settings.apply')}
                        </Button>
                      </div>
                    </div>
                  )}
                  {selected === 2 && (
                    <div className='flex h-full flex-col justify-between'>
                      <div className='container'>
                        <h2 className='mb-4 text-xl font-bold'>{t('settings.manageNotifications')}</h2>
                        {notificationProvidersList.map((notificationProvider, index) => (
                          <AddNotificationProvider
                            key={index}
                            initialName={notificationProvider.name}
                            initialTriggers={notificationProvider.triggers}
                            initialConfig={notificationProvider.config}
                            handleChange={(name, triggers, config) =>
                              handleNotificationProviderChange(name, triggers, config, index)
                            }
                            handleRemove={() => handleNotificationProviderRemove(index)}
                            testNotificationProviderAction={testNotificationProviderAction}
                          />
                        ))}
                        <div className='text-center'>
                          <Button
                            variant='filled'
                            title={t('notification.buttonAdd')}
                            className='text-md bg-gray-300 text-black shadow-none dark:bg-gray-600 dark:text-white'
                            onClick={() =>
                              setNotificationProvidersList([
                                ...notificationProvidersList,
                                { name: 'stdout', triggers: [] },
                              ])
                            }
                          >
                            <HiOutlinePlus className='h-6 w-6 dark:text-white' />
                          </Button>
                        </div>
                      </div>
                      <div className='flex flex-row justify-between'>
                        <div />
                        <Button onClick={handleSaveNotificationProviders} className='shadow-none'>
                          {t('settings.apply')}
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                skeleton
              )}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
