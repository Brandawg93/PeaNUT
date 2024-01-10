import React, { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Navbar, Typography, Select, Option, IconButton, Drawer, Card } from '@material-tailwind/react'
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/solid'

import { LanguageContext } from '@/client/context/language'
import logo from '@/app/icon.svg'
import Refresh from './refresh'
import DayNightSwitch from './daynight/mobile'
import { DEVICE } from '@/common/types'

type Props = {
  onRefreshClick: () => void
  onRefetch: () => void
  onDeviceChange: (serial: string) => void
  devices: Array<any>
  disableRefresh: boolean
}

export default function NavBar(props: Props) {
  const { onRefreshClick, onRefetch, onDeviceChange, devices, disableRefresh } = props
  const [device, setDevice] = useState(devices[0])
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)

  const handleSelect = (eventKey: string | undefined) => {
    if (!eventKey) return
    setDevice(devices.find((d: DEVICE) => d['device.serial'] === eventKey))
    onDeviceChange(eventKey)
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
      value={device['device.serial']}
    >
      {devices.map((d: DEVICE) => (
        <Option key={d['device.serial']} value={d['device.serial']}>{`${d['device.mfr']} ${d['device.model']}`}</Option>
      ))}
    </Select>
  )

  return (
    <Navbar
      variant='gradient'
      color='gray'
      className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none bg-gradient-to-t from-gray-300 to-gray-100 px-4 py-2 lg:px-8 lg:py-4 dark:from-gray-950 dark:to-gray-900'
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
              <Refresh disabled={disableRefresh} onClick={onRefreshClick} onRefetch={onRefetch} />
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
              <Card color='transparent' shadow={false} className='h-[calc(100vh-2rem)] w-full p-4 dark:text-white'>
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
                  <Refresh disabled={disableRefresh} onClick={onRefreshClick} onRefetch={onRefetch} />
                </div>
                <div className='mb-2 mt-3'>{devices.length > 1 ? dropdown('outlined') : null}</div>
                <hr />
                <div className='grid grid-flow-row grid-cols-2'>
                  <div className='flex flex-col justify-center'>
                    <Typography className='font-medium text-gray-800 dark:text-gray-300'>
                      {t('sidebar.theme')}
                    </Typography>
                  </div>
                  <div className='mb-3 mt-3'>
                    <DayNightSwitch />
                  </div>
                </div>
                <hr />
              </Card>
            </Drawer>
          </div>
        </div>
      </div>
    </Navbar>
  )
}
