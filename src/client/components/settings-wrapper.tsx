'use client'

import React, { useState, useEffect, useContext } from 'react'
import { Card } from '@/client/components/ui/card'
import { Button } from '@/client/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/client/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/client/components/ui/accordion'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { useTranslation } from 'react-i18next'
import { Toaster, toast } from 'sonner'
import CodeMirror from '@uiw/react-codemirror'
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode'
import { yaml } from '@codemirror/lang-yaml'
import { useTheme } from 'next-themes'
import { LanguageContext } from '@/client/context/language'
import { SiInfluxdb } from 'react-icons/si'
import {
  HiOutlineServerStack,
  HiOutlinePlus,
  HiOutlineInformationCircle,
  HiOutlineBellAlert,
  HiOutlineCodeBracket,
  HiOutlineLink,
  HiOutlineLinkSlash,
} from 'react-icons/hi2'
import { LuTerminal, LuCircleHelp } from 'react-icons/lu'
import { AiOutlineSave, AiOutlineDownload } from 'react-icons/ai'
import Footer from '@/client/components/footer'
import AddServer from '@/client/components/add-server'
import AddNotificationProvider from '@/client/components/add-notification-provider'
import AddInflux from './add-influx'
import { SettingsType } from '@/server/settings'
import { NotificationProviders, NotificationTrigger, NotifierSettings, server } from '@/common/types'
import { DEFAULT_INFLUX_INTERVAL } from '@/common/constants'
import dynamic from 'next/dynamic'

const NutTerminal = dynamic(() => import('@/client/components/terminal'), { ssr: false })

type SettingsWrapperProps = Readonly<{
  checkSettingsAction: () => Promise<boolean>
  getSettingsAction: <K extends keyof SettingsType>(key: K) => Promise<any>
  setSettingsAction: <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => Promise<void>
  exportSettingsAction: () => Promise<string>
  importSettingsAction: (settings: string) => Promise<void>
  deleteSettingsAction: (key: keyof SettingsType) => Promise<void>
  updateServersAction: (newServers: Array<server>) => Promise<void>
  testConnectionAction: (server: string, port: number, username?: string, password?: string) => Promise<string>
  testInfluxConnectionAction: (server: string, token: string, org: string, bucket: string) => Promise<void>
  updateNotificationProvidersAction: (newNotificationProviders: Array<NotifierSettings>) => Promise<void>
  testNotificationProviderAction: (
    name: (typeof NotificationProviders)[number],
    config: { [x: string]: string } | undefined
  ) => Promise<string>
}>

export default function SettingsWrapper({
  checkSettingsAction,
  getSettingsAction,
  setSettingsAction,
  exportSettingsAction,
  importSettingsAction,
  deleteSettingsAction,
  updateServersAction,
  testConnectionAction,
  testInfluxConnectionAction,
  updateNotificationProvidersAction,
  testNotificationProviderAction,
}: SettingsWrapperProps) {
  const [config, setConfig] = useState<string>('')
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [serverList, setServerList] = useState<Array<{ id: string; server: server; saved: boolean }>>([])
  const [influxServer, setInfluxServer] = useState<string>('')
  const [influxToken, setInfluxToken] = useState<string>('')
  const [influxOrg, setInfluxOrg] = useState<string>('')
  const [influxBucket, setInfluxBucket] = useState<string>('')
  const [influxInterval, setInfluxInterval] = useState<number>(10)
  const [notificationProvidersList, setNotificationProvidersList] = useState<Array<NotifierSettings>>([])
  const [selectedServer, setSelectedServer] = useState<string>('')
  const [connected, setConnected] = useState(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { resolvedTheme, theme } = useTheme()

  useEffect(() => {
    checkSettingsAction().then(async (res) => {
      if (!res) {
        setSettingsLoaded(true)
      } else {
        const [servers, influxHost, influxToken, influxOrg, influxBucket, influxInterval, notificationProviders] = await Promise.all([
          getSettingsAction('NUT_SERVERS'),
          getSettingsAction('INFLUX_HOST'),
          getSettingsAction('INFLUX_TOKEN'),
          getSettingsAction('INFLUX_ORG'),
          getSettingsAction('INFLUX_BUCKET'),
          getSettingsAction('INFLUX_INTERVAL'),
          getSettingsAction('NOTIFICATION_PROVIDERS'),
        ])
        if (servers?.length) {
          setServerList([
            ...servers.map((server: server) => ({
              id: `${server.HOST}:${server.PORT}-${Date.now()}`,
              server,
              saved: true,
            })),
          ])
          if (servers.length === 1) {
            setSelectedServer(`${servers[0].HOST}:${servers[0].PORT}`)
          }
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
        setSettingsLoaded(true)
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
    setServerList((prevList) => {
      const updatedList = [...prevList]
      updatedList[index] = {
        ...updatedList[index],
        server: {
          ...updatedList[index].server,
          HOST: server,
          PORT: port,
          USERNAME: username,
          PASSWORD: password,
        },
      }
      return updatedList
    })
  }

  const handleServerRemove = async (index: number) => {
    setServerList((prevList) => prevList.filter((_, i) => i !== index))
  }

  const handleSaveServers = async () => {
    await updateServersAction(serverList.map(({ server }) => server))
    setServerList((prevList) => prevList.map((item) => ({ ...item, saved: true })))
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

  const handleSettingsImport = async () => {
    await importSettingsAction(config)
    toast.success(t('settings.saved'))
  }

  const handleCodeChange = (value: string) => {
    setConfig(value)
  }

  const handleSettingsMenuChange = (value: string) => {
    if (value === 'config') {
      exportSettingsAction().then((res) => {
        setConfig(res)
      })
    }
  }

  const skeleton = (
    <div className='flex flex-col gap-3'>
      <Card className='border-card bg-card h-[150px] w-full animate-pulse rounded-lg border p-6' />
      <Card className='border-card bg-card h-[150px] w-full animate-pulse rounded-lg border p-6' />
      <Card className='border-card bg-card h-[150px] w-full animate-pulse rounded-lg border p-6' />
    </div>
  )

  const menuItems = [
    { label: t('settings.manageServers'), Icon: HiOutlineServerStack, value: 'servers' },
    { label: t('settings.influxDb'), Icon: SiInfluxdb, value: 'influx' },
    { label: t('settings.manageNotifications'), Icon: HiOutlineBellAlert, value: 'notifications' },
    { label: t('settings.configExport'), Icon: HiOutlineCodeBracket, value: 'config' },
    { label: t('settings.terminal'), Icon: LuTerminal, value: 'terminal' },
  ]

  return (
    <div className='flex flex-1 flex-col px-3' data-testid='settings-wrapper'>
      <Toaster position='top-center' theme={theme as 'light' | 'dark' | 'system'} richColors />
      <div className='flex justify-center'>
        <div className='container'>
          <h1 className='mb-4 text-2xl font-bold'>{t('sidebar.settings')}</h1>
        </div>
      </div>
      <div className='flex flex-1 justify-center'>
        <div className='container'>
          <Tabs
            defaultValue='servers'
            className='flex h-full flex-col gap-4 md:flex-row'
            onValueChange={handleSettingsMenuChange}
          >
            <TabsList className='flex h-min w-full flex-col gap-2 sm:flex-row md:w-auto md:flex-col'>
              {menuItems.map(({ label, Icon, value }) => (
                <TabsTrigger key={value} value={value} className='w-full cursor-pointer justify-start'>
                  <div className='mr-4'>
                    <Icon className='size-6!' />
                  </div>
                  <span>{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value='servers' className='mt-0 h-full flex-1'>
              {settingsLoaded ? (
                <Card className='p-4 shadow-none'>
                  <div className='container'>
                    <h2 className='text-xl font-bold'>{t('settings.manageServers')}</h2>
                    <div className='mb-4'>
                      <span className='text-muted-foreground text-sm'>
                        <HiOutlineInformationCircle className='inline-block size-4' />
                        &nbsp;{t('settings.serversNotice')}
                      </span>
                    </div>
                    {serverList.map((server, index) => (
                      <AddServer
                        saved={server.saved}
                        key={server.id}
                        initialServer={server.server.HOST}
                        initialPort={server.server.PORT}
                        initialUsername={server.server.USERNAME}
                        initialPassword={server.server.PASSWORD}
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
                        className='cursor-pointer shadow-none'
                        onClick={() =>
                          setServerList((prevList) => [
                            ...prevList,
                            {
                              id: `new-server-${Date.now()}`,
                              server: { HOST: '', PORT: 0 },
                              saved: false,
                            },
                          ])
                        }
                      >
                        <HiOutlinePlus className='size-6! stroke-2' />
                      </Button>
                    </div>
                  </div>
                  <div className='flex flex-row justify-between'>
                    <div />
                    <Button onClick={handleSaveServers} className='cursor-pointer shadow-none'>
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
                  <h2 className='text-xl font-bold'>{t('settings.manageServers')}</h2>
                  <div className='mb-4'>
                    <span className='text-muted-foreground text-sm'>
                      <HiOutlineInformationCircle className='inline-block size-4' />
                      &nbsp;{t('settings.influxNotice')}
                    </span>
                  </div>
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
                      setInfluxInterval(DEFAULT_INFLUX_INTERVAL)
                      deleteSettingsAction('INFLUX_HOST')
                      deleteSettingsAction('INFLUX_TOKEN')
                      deleteSettingsAction('INFLUX_ORG')
                      deleteSettingsAction('INFLUX_BUCKET')
                      setSettingsAction('INFLUX_INTERVAL', DEFAULT_INFLUX_INTERVAL)
                    }}
                    testInfluxConnectionAction={testInfluxConnectionAction}
                  />
                </div>
                <div className='flex flex-row justify-between'>
                  <div />
                  <Button onClick={handleSaveInflux} className='cursor-pointer shadow-none'>
                    {t('settings.apply')}
                  </Button>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value='notifications' className='mt-0 h-full flex-1'>
              <Card className='p-4 shadow-none'>
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
                      variant='secondary'
                      title={t('notification.buttonAdd')}
                      className='shadow-none'
                      onClick={() =>
                        setNotificationProvidersList([...notificationProvidersList, { name: 'stdout', triggers: [] }])
                      }
                    >
                      <HiOutlinePlus className='!h-6 !w-6' />
                    </Button>
                  </div>
                </div>
                <div className='flex flex-row justify-between'>
                  <div />
                  <Button onClick={handleSaveNotificationProviders} className='shadow-none'>
                    {t('settings.apply')}
                  </Button>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value='config' className='mt-0 h-full flex-1'>
              <Card className='p-4 shadow-none'>
                <div className='container'>
                  <h2 className='mb-4 text-xl font-bold'>{t('settings.configExport')}</h2>
                  <span>{t('settings.configExportNotice')}</span>
                  <Accordion type='single' collapsible className='mb-2 w-full'>
                    <AccordionItem value='item-1'>
                      <AccordionTrigger>{t('settings.viewConfig')}</AccordionTrigger>
                      <AccordionContent>
                        <div className='border-border-card mb-2 overflow-hidden rounded-lg border'>
                          <CodeMirror
                            theme={resolvedTheme === 'dark' ? vscodeDark : vscodeLight}
                            value={config}
                            extensions={[yaml()]}
                            onChange={handleCodeChange}
                          />
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                  <div className='flex flex-row'>
                    <Button onClick={handleSettingsImport} className='flex cursor-pointer shadow-none'>
                      <AiOutlineSave className='size-4' />
                      &nbsp;
                      <span className='self-center'>{t('settings.save')}</span>
                    </Button>
                    &nbsp;
                    <Button
                      onClick={async () => {
                        const a = document.createElement('a')
                        const text = await exportSettingsAction()
                        const file = new Blob([text], { type: 'application/yaml' })
                        a.href = URL.createObjectURL(file)
                        a.download = 'peanut_config.yaml'
                        a.click()
                      }}
                      className='flex cursor-pointer shadow-none'
                    >
                      <AiOutlineDownload className='size-4' />
                      &nbsp;
                      <span className='self-center'>{t('settings.download')}</span>
                    </Button>
                  </div>
                </div>
              </Card>
            </TabsContent>
            <TabsContent value='terminal' className='mt-0 h-full flex-1 overflow-x-hidden'>
              <Card className='p-4 shadow-none'>
                <div className='container'>
                  <h2 className='mb-4 text-xl font-bold'>
                    {t('settings.terminal')}
                    <a
                      href='https://networkupstools.org/docs/developer-guide.chunked/net-protocol.html'
                      target='_blank'
                      rel='noreferrer'
                      className='ml-2 inline-block'
                    >
                      <LuCircleHelp className='size-4' />
                    </a>
                  </h2>
                  <span>{t('settings.terminalNotice')}</span>
                  <div className='mt-4 mb-4 flex gap-2'>
                    {!connected && (
                      <>
                        <Select onValueChange={setSelectedServer} value={selectedServer}>
                          <SelectTrigger className='w-[200px]'>
                            <SelectValue placeholder={t('settings.selectServer')} />
                          </SelectTrigger>
                          <SelectContent>
                            {serverList.map(({ server }) => (
                              <SelectItem key={`${server.HOST}:${server.PORT}`} value={`${server.HOST}:${server.PORT}`}>
                                {server.HOST}:{server.PORT}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          className='cursor-pointer'
                          onClick={() => setConnected(true)}
                          disabled={!selectedServer}
                        >
                          <HiOutlineLink />
                          {t('connect.connect')}
                        </Button>
                      </>
                    )}
                    {connected && (
                      <Button onClick={() => setConnected(false)} variant='destructive' className='cursor-pointer'>
                        <HiOutlineLinkSlash />
                        {t('sidebar.disconnect')}
                      </Button>
                    )}
                  </div>
                  {connected && selectedServer && (
                    <NutTerminal host={selectedServer.split(':')[0]} port={parseInt(selectedServer.split(':')[1])} />
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <div className='flex justify-center'>
        <div className='container'>
          <Footer />
        </div>
      </div>
    </div>
  )
}
