'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import Image from 'next/image'
import Link from 'next/link'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Button } from '@/client/components/ui/button'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'

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

  return (
    <div className='flex justify-center'>
      <div className='container z-10 mb-4 mt-2'>
        <div
          className='h-max max-w-full rounded-lg border border-border bg-card px-4 py-2 lg:px-8 lg:py-4'
          data-testid='navbar'
        >
          <div className='flex items-center justify-between'>
            <Link
              href='#'
              className='flex cursor-pointer py-1.5 text-xl font-medium text-black no-underline dark:text-white'
            >
              <Image alt='' src={logo} width='30' height='30' className='d-inline-block align-top' />
              <span className={devices.length > 1 ? 'hidden sm:block' : 'block'}>&nbsp;PeaNUT</span>
            </Link>
            <div className='flex items-center'>
              <div>
                {devices.length > 1 ? (
                  <Select onValueChange={handleSelect} value={device.name}>
                    <SelectTrigger className='w-48 border-border-card'>
                      <SelectValue placeholder={t('selectDevice')} />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((d: DEVICE) => (
                        <SelectItem key={d.name} value={d.name}>
                          {d.description || `${d.vars['device.mfr']?.value} ${d.vars['device.model']?.value}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : null}
              </div>
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
                <Button
                  variant='ghost'
                  size='lg'
                  className='px-3'
                  title={t('sidebar.settings')}
                  aria-label={t('sidebar.settings')}
                  onClick={() => router.push('/settings')}
                >
                  <HiOutlineCog6Tooth className='!h-6 !w-6 text-black dark:text-white' />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
