'use client'

import React, { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/client/components/ui/button'
import { TbSettings, TbSettingsExclamation } from 'react-icons/tb'
import { LuLogOut } from 'react-icons/lu'
import { LanguageContext } from '@/client/context/language'
import Refresh from '@/client/components/refresh'
import TimeTruncation from '@/client/components/time-truncation'
import LanguageSwitcher from '@/client/components/language-switcher'
import DayNightSwitch from '@/client/components/daynight'
import { getLocalStorageItem } from '@/lib/utils'
import { useNavigation } from '@/hooks/useNavigation'
import { useAuth } from '@/client/context/auth'

type Props = Readonly<{
  onRefreshClick: () => void
  onRefetch: () => void
  onLogout: () => void
  disableRefresh: boolean
  failedServers?: Array<string>
}>

export default function NavBarControls(props: Props) {
  const { onRefreshClick, onRefetch, onLogout, disableRefresh, failedServers } = props
  const [refreshInterval, setRefreshInterval] = useState<number>(() => {
    const stored = getLocalStorageItem('refreshInterval')
    return stored !== null ? Number(stored) : 0
  })
  const lng = useContext<string>(LanguageContext)
  const { t } = useTranslation(lng)
  const { push } = useNavigation()
  const { authEnabled } = useAuth()

  useEffect(() => {
    if (refreshInterval > 0) {
      const interval = setInterval(() => onRefetch(), refreshInterval * 1000)
      return () => clearInterval(interval)
    }
  }, [refreshInterval, onRefetch])

  return (
    <div className='flex items-center justify-between space-x-2 pl-2 sm:justify-end'>
      <div className='flex items-center space-x-2'>
        <TimeTruncation disabled={disableRefresh} />
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
        {authEnabled ? (
          <div className='hidden sm:block'>
            <Button
              className='cursor-pointer'
              variant='ghost'
              size='icon'
              title={t('logout')}
              aria-label={t('logout')}
              onClick={onLogout}
            >
              <LuLogOut className='size-6! cursor-pointer stroke-[1.5px]' />
            </Button>
          </div>
        ) : null}
        <div>
          <Button
            variant='ghost'
            className='cursor-pointer'
            size='icon'
            title={t('sidebar.settings')}
            aria-label={t('sidebar.settings')}
            onClick={() => push('/settings')}
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
