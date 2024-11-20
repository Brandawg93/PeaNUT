'use client'

import React, { useState, useEffect } from 'react'
import { Card, List, ListItem, ListItemPrefix } from '@material-tailwind/react'
import { useRouter } from 'next/navigation'
import { SiInfluxdb } from '@icons-pack/react-simple-icons'
import { ServerStackIcon } from '@heroicons/react/24/outline'
import Footer from '@/client/components/footer'
import AddServer from '@/client/components/add-server'

type SettingsWrapperProps = {
  checkSettingsAction: () => Promise<boolean>
  getSettingsAction: (key: string) => Promise<any>
}

export default function SettingsWrapper({ checkSettingsAction, getSettingsAction }: SettingsWrapperProps) {
  const [selected, setSelected] = useState<number>(1)
  const [server, setServer] = useState<string>('')
  const [port, setPort] = useState<number>(0)
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(false)

  const router = useRouter()

  const setSelectedItem = (value: number) => setSelected(value)
  const selectedStyle = { color: 'black', fill: 'black' }

  useEffect(() => {
    checkSettingsAction().then(async (res) => {
      setSettingsLoaded(true)
      if (!res) {
        router.replace('/login')
      } else {
        const [settingsServer, settingsPort] = await Promise.all([
          getSettingsAction('NUT_HOST'),
          getSettingsAction('NUT_PORT'),
        ])
        if (settingsServer) {
          setServer(settingsServer)
        }
        if (settingsPort) {
          setPort(+settingsPort)
        }
      }
    })
  }, [])

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
              <Card className='bg-white lg:w-96 dark:bg-gray-800'>
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
            {selected === 1 && (
              <div className='flex h-full w-full flex-1 flex-col gap-3 rounded-lg bg-white p-3 dark:bg-gray-800'>
                {settingsLoaded ? (
                  <AddServer
                    server={server}
                    port={port}
                    setServer={() => null}
                    setPort={() => null}
                    handleSubmit={() => null}
                  />
                ) : (
                  skeleton
                )}
              </div>
            )}
          </div>
          <Footer />
        </div>
      </div>
    </div>
  )
}
