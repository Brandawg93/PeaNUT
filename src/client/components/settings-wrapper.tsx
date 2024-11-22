'use client'

import 'react-toastify/dist/ReactToastify.css'
import React, { useState, useEffect, useContext } from 'react'
import { Button, Card, List, ListItem, ListItemPrefix } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { LanguageContext } from '@/client/context/language'
import { SiInfluxdb } from '@icons-pack/react-simple-icons'
import { ServerStackIcon, PlusIcon } from '@heroicons/react/24/outline'
import Footer from '@/client/components/footer'
import AddServer from '@/client/components/add-server'
import AddInflux from './add-influx'

type SettingsWrapperProps = {
  checkSettingsAction: () => Promise<boolean>
  getSettingsAction: (key: string) => Promise<any>
  setSettingsAction: (key: string, value: any) => Promise<void>
  testConnectionAction: (server: string, port: number) => Promise<string>
}

export default function SettingsWrapper({
  checkSettingsAction,
  getSettingsAction,
  setSettingsAction,
  testConnectionAction,
}: SettingsWrapperProps) {
  const [selected, setSelected] = useState<number>(1)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)
  const [serverList, setServerList] = useState<Array<{ host: string; port: number }>>([])
  const [influxServer, setInfluxServer] = useState<string>('')
  const [influxPort, setInfluxPort] = useState<number>(0)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const router = useRouter()

  const setSelectedItem = (value: number) => setSelected(value)
  const selectedStyle = { color: 'black', fill: 'black' }

  useEffect(() => {
    checkSettingsAction().then(async (res) => {
      setSettingsLoaded(true)
      if (!res) {
        router.replace('/login')
      } else {
        const [settingsServer, settingsPort, influxHost, influxPort] = await Promise.all([
          getSettingsAction('NUT_HOST'),
          getSettingsAction('NUT_PORT'),
          getSettingsAction('INFLUX_HOST'),
          getSettingsAction('INFLUX_PORT'),
        ])
        if (settingsServer && settingsPort) {
          setServerList([{ host: settingsServer, port: settingsPort }])
        }
        if (influxHost && influxPort) {
          setInfluxServer(influxHost)
          setInfluxPort(influxPort)
        }
      }
    })
  }, [])

  const handleServerChange = (server: string, port: number, index: number) => {
    const updatedServerList = [...serverList]
    updatedServerList[index].host = server
    updatedServerList[index].port = port
    setServerList(updatedServerList)
  }

  const handleSaveServers = () => null
  const handleSaveInflux = () => {
    setSettingsAction('INFLUX_HOST', influxServer)
    setSettingsAction('INFLUX_PORT', influxPort)
  }

  const skeleton = (
    <div className='flex flex-col gap-3'>
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
      <div className='h-[150px] w-full animate-pulse rounded-lg p-6 dark:bg-gray-600' />
    </div>
  )

  return (
    <div className='flex flex-1 flex-col pl-3 pr-3' data-testid='settings-wrapper'>
      <div className='flex justify-center'>
        <div className='container'>
          <h1 className='mb-4 text-2xl font-bold'>Settings</h1>
        </div>
      </div>
      <div className='flex flex-1 justify-center'>
        <div className='container flex flex-1 flex-col justify-between'>
          <div className='flex h-full flex-row gap-2'>
            <div>
              <Card className='bg-white dark:bg-gray-800'>
                <List className='min-w-0'>
                  <ListItem
                    selected={selected === 1}
                    onClick={() => setSelectedItem(1)}
                    className='active: text-black hover:text-black dark:text-white'
                    style={selected === 1 ? selectedStyle : {}}
                  >
                    <ListItemPrefix className='mr-0 lg:mr-4'>
                      <ServerStackIcon className='h-6 w-6' style={selected === 1 ? { color: 'black' } : {}} />
                    </ListItemPrefix>
                    <span className='hidden lg:block'>Manage Servers</span>
                  </ListItem>
                  <ListItem
                    selected={selected === 2}
                    onClick={() => setSelectedItem(2)}
                    className='active: text-black hover:fill-black dark:fill-white dark:text-white'
                    style={selected === 2 ? selectedStyle : {}}
                  >
                    <ListItemPrefix className='mr-0 lg:mr-4'>
                      <SiInfluxdb className='fill-inherit' style={selected === 2 ? selectedStyle : {}} />
                    </ListItemPrefix>
                    <span className='hidden lg:block'>InfluxDB v2</span>
                  </ListItem>
                </List>
              </Card>
            </div>
            <div className='flex h-full w-full flex-1 flex-col gap-3 rounded-lg bg-white p-3 dark:bg-gray-800'>
              {settingsLoaded ? (
                <>
                  {selected === 1 && (
                    <div className='flex h-full flex-col justify-between'>
                      <div className='container'>
                        <h2 className='mb-4 text-xl font-bold'>{t('settings.manageServers')}</h2>
                        {serverList.map((server, index) => (
                          <AddServer
                            removable={serverList.length > 1}
                            key={index}
                            initialServer={server.host}
                            initialPort={server.port}
                            handleChange={(server, port) => handleServerChange(server, port, index)}
                            handleRemove={() => setServerList(serverList.filter((_, i) => i !== index))}
                            testConnectionAction={testConnectionAction}
                          />
                        ))}
                        <div className='text-center'>
                          <Button
                            variant='filled'
                            title={t('settings.addServer')}
                            className='text-md bg-gray-300 text-black shadow-none dark:bg-gray-600 dark:text-white'
                            onClick={() => setServerList([...serverList, { host: '', port: 0 }])}
                          >
                            <PlusIcon className='h-6 w-6 dark:text-white' />
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
                  {selected === 2 && (
                    <div className='flex h-full flex-col justify-between'>
                      <div className='container'>
                        <h2 className='mb-4 text-xl font-bold'>{t('settings.influxDb')}</h2>
                        <AddInflux
                          initialServer={influxServer}
                          initialPort={influxPort}
                          handleChange={(server, port) => {
                            setInfluxServer(server)
                            setInfluxPort(port)
                          }}
                          testConnectionAction={testConnectionAction}
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
