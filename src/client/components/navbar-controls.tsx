'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/client/components/ui/select'
import { Button } from '@/client/components/ui/button'
import { TbSettings, TbSettingsExclamation } from 'react-icons/tb'
import { LuLogOut } from 'react-icons/lu'
import { LanguageContext } from '@/client/context/language'
import Refresh from '@/client/components/refresh'
import { DEVICE } from '@/common/types'
import LanguageSwitcher from '@/client/components/language-switcher'
import DayNightSwitch from '@/client/components/daynight'

type Props = {
  onRefreshClick: () => void
  onRefetch: () => void
  onDeviceChange: (name: string) => void
  onLogout: () => void
  devices: Array<DEVICE>
  disableRefresh: boolean
  failedServers?: Array<string>
}

export default function NavBarControls(props: Props) {
  const { onRefreshClick, onRefetch, onDeviceChange, onLogout, devices, disableRefresh, failedServers } = props
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
    <div className='flex items-center justify-between space-x-2 pl-2 sm:justify-end'>
      <div>
        {devices.length > 1 ? (
          <Select onValueChange={handleSelect} value={device.name}>
            <SelectTrigger className='border-border-card w-48'>
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
      <div className='flex items-center space-x-2'>
        <div>
          <Refresh
            disabled={disableRefresh}
            onClick={onRefreshClick}
            onRefreshChange={(interval) => setRefreshInterval(interval)}
            refreshInterval={refreshInterval}
          />
        </div>
        <div className='hidden sm:block'>
          <DayNightSwitch />
        </div>
        <div className='hidden sm:block'>
          <LanguageSwitcher />
        </div>
        <div>
          <Button variant='ghost' size='icon' title={t('logout')} aria-label={t('logout')} onClick={onLogout}>
            <LuLogOut className='size-6! stroke-[1.5px]' />
          </Button>
        </div>
        <div>
          <Button
            variant='ghost'
            size='icon'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => router.push('/settings')}
          >
            {failedServers ? (
              <TbSettingsExclamation className='size-6! stroke-[1.5px]' />
            ) : (
              <TbSettings className='size-6! stroke-[1.5px]' />
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
