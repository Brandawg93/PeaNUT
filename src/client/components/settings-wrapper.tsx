'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Card } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { ToastContainer, toast } from 'react-toastify'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { SiInfluxdb } from 'react-icons/si'
import { HiOutlineServerStack, HiOutlinePlus, HiOutlineInformationCircle } from 'react-icons/hi2'
import Footer from '@/client/components/footer'
import AddServer from '@/client/components/add-server'
import AddInflux from './add-influx'
import { SettingsType } from '@/server/settings'
import { server } from '@/common/types'

type SettingsWrapperProps = {
  checkSettingsAction: () => Promise<boolean>
  getSettingsAction: <K extends keyof SettingsType>(key: K) => Promise<any>
  setSettingsAction: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>
  deleteSettingsAction: (key: keyof SettingsType) => Promise<void>
  updateServersAction: (newServers: Array<server>) => Promise<void>
  testConnectionAction: (server: string, port: number) => Promise<string>
  testInfluxConnectionAction: (server: string, token: string, org: string, bucket: string) => Promise<void>
}

export default function SettingsWrapper({
  checkSettingsAction,
  getSettingsAction,
  setSettingsAction,
  deleteSettingsAction,
  updateServersAction,
  testConnectionAction,
  testInfluxConnectionAction,
}: SettingsWrapperProps) {
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [serverList, setServerList] = useState<Array<server>>([])
  const [influxServer, setInfluxServer] = useState<string>('')
  const [influxToken, setInfluxToken] = useState<string>('')
  const [influxOrg, setInfluxOrg] = useState<string>('')
  const [influxBucket, setInfluxBucket] = useState<string>('')
  const [influxInterval, setInfluxInterval] = useState<number>(10)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { resolvedTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    checkSettingsAction().then(async (res) => {
      setSettingsLoaded(true)
      if (!res) {
        router.replace('/login')
      } else {
        const [servers, influxHost, influxToken, influxOrg, influxBucket, influxInterval] = await Promise.all([
          getSettingsAction('NUT_SERVERS'),
          getSettingsAction('INFLUX_HOST'),
          getSettingsAction('INFLUX_TOKEN'),
          getSettingsAction('INFLUX_ORG'),
          getSettingsAction('INFLUX_BUCKET'),
          getSettingsAction('INFLUX_INTERVAL'),
        ])
        if (servers) {
          setServerList([...servers])
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

  const skeleton = (
    <div className='flex flex-col gap-3'>
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
    </div>
  )

  const menuItems = [
    { label: t('settings.manageServers'), Icon: HiOutlineServerStack, value: 'servers' },
    { label: t('settings.influxDb'), Icon: SiInfluxdb, value: 'influx' },
  ]

  return (
    <div className='flex flex-1 flex-col pl-3 pr-3' data-testid='settings-wrapper'>
      <ToastContainer position='top-center' theme={resolvedTheme} />
      <div className='flex justify-center'>
        <div className='container'>
          <h1 className='mb-4 text-2xl font-bold'>{t('sidebar.settings')}</h1>
        </div>
      </div>
      <div className='flex flex-1 justify-center'>
        <div className='container'>
          <Tabs defaultValue='servers' className='flex h-full gap-4'>
            <TabsList className='flex h-min flex-col gap-4'>
              {menuItems.map(({ label, Icon, value }, index) => (
                <TabsTrigger key={index} value={value} className='w-full justify-start'>
                  <div className='mr-0 lg:mr-4'>
                    <Icon className='!h-6 !w-6' />
                  </div>
                  <span className='hidden lg:block'>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value='servers' className='mt-0 h-full flex-1'>
              {settingsLoaded ? (
                <Card className='p-4 shadow-none'>
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
                        variant='secondary'
                        title={t('settings.addServer')}
                        className='shadow-none'
                        onClick={() => setServerList([...serverList, { HOST: '', PORT: 0 }])}
                      >
                        <HiOutlinePlus className='!h-6 !w-6 stroke-2' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex flex-row justify-between'>
                    <div />
                    <Button onClick={handleSaveServers} className='shadow-none'>
                      {t('settings.apply')}
                    </Button>
                  </div>
                </Card>
              ) : (
                skeleton
              )}
            </TabsContent>
            <TabsContent value='influx' className='mt-0 h-full flex-1'>
              <Card className='p-4 shadow-none'>
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
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </div>
  )
}
