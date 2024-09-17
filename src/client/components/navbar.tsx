import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Navbar, Typography, Select, Option, IconButton, Drawer, Card, Button } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon, ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/solid'

import { LanguageContext } from '@/client/context/language'
import logo from '@/app/icon.svg'
import Refresh from '@/client/components/refresh'
import DayNightSwitch from '@/client/components/daynight/mobile'
import { DEVICE } from '@/common/types'

type Props = {
  onRefreshClick: () => void
  onRefetch: () => void
  onDeviceChange: (name: string) => void
  onDisconnect: () => void
  devices: Array<DEVICE>
  disableRefresh: boolean
}

export default function NavBar(props: Props) {
  const { onRefreshClick, onRefetch, onDeviceChange, onDisconnect, devices, disableRefresh } = props
  const [device, setDevice] = useState(devices[0])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [refreshInterval, setRefreshInterval] = useState(localStorage.getItem('refreshInterval') || '0')
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  useEffect(() => {
    if (parseInt(refreshInterval) > 0) {
      const interval = setInterval(() => onRefetch(), parseInt(refreshInterval) * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval])

  const handleSelect = (eventKey: string | undefined) => {
    if (!eventKey) return
    const selectedDevice = devices.find((d: DEVICE) => d.name === eventKey)
    if (selectedDevice) {
      setDevice(selectedDevice)
      onDeviceChange(eventKey)
    }
  }

  const openDrawer = () => setIsDrawerOpen(!isDrawerOpen)
  const closeDrawer = () => setIsDrawerOpen(false)

  const dropdown = (variant: any = 'standard') => (
    <Select
      variant={variant}
      className='dark:text-gray-300'
      menuProps={{ className: 'dark:bg-gray-900 dark:border-gray-800 dark:text-white' }}
      labelProps={{ className: 'dark:text-gray-300' }}
      label='Select Device'
      onChange={handleSelect}
      value={device.name}
    >
      {devices.map((d: DEVICE) => (
        <Option key={d.name} value={d.name}>
          {d.description || `${d.vars['device.mfr']?.value} ${d.vars['device.model']?.value}`}
        </Option>
      ))}
    </Select>
  )

  return (
    <Navbar
      variant='gradient'
      color='gray'
      className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none bg-gradient-to-t from-gray-300 to-gray-100 px-4 py-2 dark:from-gray-950 dark:to-gray-900 lg:px-8 lg:py-4'
    >
      <div className='container'>
        <div className='flex items-center justify-between'>
          <Typography
            as='a'
            href='#'
            className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
          >
            <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
            &nbsp;PeaNUT
          </Typography>
          <div className='flex items-center'>
            <div className='hidden lg:block'>{devices.length > 1 ? dropdown() : null}</div>
            &nbsp;
            <div className='hidden lg:block'>
              <Refresh
                disabled={disableRefresh}
                onClick={onRefreshClick}
                onRefreshChange={(interval) => setRefreshInterval(interval)}
                refreshInterval={refreshInterval}
              />
            </div>
            &nbsp;
            <div className='hidden lg:block'>
              <Button
                variant='filled'
                title={t('sidebar.disconnect')}
                className='text-md float-right bg-red-400 text-black shadow-none dark:bg-red-800 dark:text-white'
                onClick={() => onDisconnect()}
              >
                <ArrowRightStartOnRectangleIcon className='h-4 w-4 stroke-2 dark:text-white' />
              </Button>
            </div>
            <IconButton variant='text' className='block lg:hidden' size='lg' onClick={openDrawer}>
              {isDrawerOpen ? (
                <XMarkIcon className='h-8 w-8 stroke-2 dark:text-white' />
              ) : (
                <Bars3Icon className='h-8 w-8 stroke-2 dark:text-white' />
              )}
            </IconButton>
            {isDrawerOpen ? (
              <div className='absolute left-0 top-0 h-screen w-screen bg-black/50 backdrop-blur'></div>
            ) : null}
            <Drawer
              overlay={false}
              open={isDrawerOpen}
              onClose={closeDrawer}
              placement='right'
              className='rounded-l dark:bg-gray-900'
            >
              <Card
                color='transparent'
                shadow={false}
                className='h-[calc(100vh-2rem)] w-full justify-between p-4 dark:text-white'
              >
                <div>
                  <div className='mb-2 flex items-center gap-4 p-4'>
                    <Typography variant='h5'>{t('sidebar.settings')}</Typography>
                    <div className='flex w-full justify-end'>
                      <IconButton variant='text' size='lg' onClick={closeDrawer}>
                        <XMarkIcon className='h-8 w-8 stroke-2 dark:text-white' />
                      </IconButton>
                    </div>
                  </div>
                  <hr />
                  <div className='mt-2'>
                    <Refresh
                      disabled={disableRefresh}
                      onClick={onRefreshClick}
                      onRefreshChange={(interval) => setRefreshInterval(interval)}
                      refreshInterval={refreshInterval}
                    />
                  </div>
                  <div className='mb-2 mt-3'>{devices.length > 1 ? dropdown('outlined') : null}</div>
                  <hr />
                  <div className='grid grid-flow-row grid-cols-2'>
                    <div className='flex flex-col justify-around'>
                      <Typography className='font-medium text-gray-800 dark:text-gray-300'>
                        {t('sidebar.theme')}
                      </Typography>
                    </div>
                    <div className='mb-3 mt-3'>
                      <DayNightSwitch />
                    </div>
                  </div>
                  <hr />
                  <div className='grid grid-flow-row grid-cols-2'>
                    <div className='flex flex-col justify-around'>
                      <Typography className='font-medium text-gray-800 dark:text-gray-300'>
                        {t('sidebar.disconnect')}
                      </Typography>
                    </div>
                    <div className='mb-3 mt-3'>
                      <Button
                        variant='filled'
                        title={t('sidebar.disconnect')}
                        className='text-md float-right bg-red-400 text-black shadow-none dark:bg-red-800 dark:text-white'
                        onClick={() => onDisconnect()}
                      >
                        <ArrowRightStartOnRectangleIcon className='h-4 w-4 stroke-2 dark:text-white' />
                      </Button>
                    </div>
                  </div>
                </div>
                <div className='mt-6 text-right text-gray-600'>
                  <a className='text-sm underline' href='/api/docs' target='_blank' rel='noreferrer'>
                    {t('docs')}
                  </a>
                </div>
              </Card>
            </Drawer>
          </div>
        </div>
      </div>
    </Navbar>
  )
}
