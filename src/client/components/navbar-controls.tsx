'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Button } from '@/client/components/ui/button'
import { HiOutlineCog6Tooth } from 'react-icons/hi2'
import { LanguageContext } from '@/client/context/language'
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

export default function NavBarControls(props: Props) {
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
    <>
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
          <HiOutlineCog6Tooth className='!h-6 !w-6' />
        </Button>
      </div>
    </>
  )
}
