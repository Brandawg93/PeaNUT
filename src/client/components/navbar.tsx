'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import { Navbar, Typography, Select, Option, IconButton } from '@material-tailwind/react'
import { Cog6ToothIcon } from '@heroicons/react/24/outline'

import { LanguageContext } from '@/client/context/language'
import logo from '@/app/icon.svg'
import Refresh from '@/client/components/refresh'
import { DEVICE } from '@/common/types'
import LanguageSwitcher from '@/client/components/language-switcher'
import DayNightSwitch from '@/client/components/daynight'

type Props = {
  onRefreshClick: () => void
  onRefetch: () => void
  onDeviceChange: (name: string) => void
  onDisconnect: () => void
  devices: Array<DEVICE>
  disableRefresh: boolean
}

export default function NavBar(props: Props) {
  const { onRefreshClick, onRefetch, onDeviceChange, devices, disableRefresh } = props
  const [device, setDevice] = useState(devices[0])
  const [refreshInterval, setRefreshInterval] = useState<number>(Number(localStorage.getItem('refreshInterval')) || 0)
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const router = useRouter()

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => onRefetch(), refreshInterval * 1000)
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

  const dropdown = (variant: 'standard' | 'outlined' = 'standard') => (
    <Select
      variant={variant}
      className='dark:text-gray-300'
      menuProps={{ className: 'dark:bg-gray-900 dark:border-gray-800 dark:text-white' }}
      labelProps={{ className: 'dark:text-gray-300' }}
      containerProps={{ className: 'min-w-[150px]' }}
      label='Select Device'
      data-testid={`device-select-${variant}`}
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
      className='sticky top-0 z-10 mb-4 flex h-max max-w-full justify-center rounded-none bg-gradient-to-t from-gray-300 to-gray-100 px-4 py-2 lg:px-8 lg:py-4 dark:from-gray-950 dark:to-gray-900'
      data-testid='navbar'
    >
      <div className='container'>
        <div className='flex items-center justify-between'>
          <Typography
            as='a'
            href='#'
            className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
          >
            <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
            <span className={devices.length > 1 ? 'hidden sm:block' : 'block'}>&nbsp;PeaNUT</span>
          </Typography>
          <div className='flex items-center'>
            <div>{devices.length > 1 ? dropdown() : null}</div>
            &nbsp;
            <div>
              <Refresh
                disabled={disableRefresh}
                onClick={onRefreshClick}
                onRefreshChange={(interval) => setRefreshInterval(interval)}
                refreshInterval={refreshInterval}
              />
            </div>
            &nbsp;
            <div className='hidden sm:block'>
              <DayNightSwitch />
            </div>
            &nbsp;
            <div className='hidden sm:block'>
              <LanguageSwitcher />
            </div>
            &nbsp;
            <div>
              <IconButton
                variant='text'
                className='px-3 text-black shadow-none hover:bg-gray-400 dark:text-white dark:hover:bg-gray-800'
                title={t('sidebar.settings')}
                onClick={() => router.push('/settings')}
              >
                <Cog6ToothIcon className='h-6 w-6 stroke-2 dark:text-white' />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </Navbar>
  )
}
